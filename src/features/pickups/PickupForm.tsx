import { skipToken } from '@reduxjs/toolkit/query';
import { Children, useState, type ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { ActivityIndicator, Button, Switch, Text, useTheme } from 'react-native-paper';

import { JAPAN_COUNTRY_ID, toOptions, type Town } from '@/api/lookups';
import {
  FORWARDERS,
  LOCKED_PICKUP_STATUSES,
  PICKUP_STATUSES,
  PICKUP_TIMES_FROM,
  PICKUP_TIMES_TO,
  PRIVATE_TIME_FROM,
  PRIVATE_TIME_TO,
  SAGAWA_FORWARDER_ID,
} from '@/api/pickups';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DateField } from '@/components/DateField';
import { FormModal } from '@/components/FormModal';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import {
  errorMessage,
  useAddPickupMutation,
  useGetPickupQuery,
  useUpdatePickupMutation,
  useGetAgentsQuery,
  useGetCitiesQuery,
  useGetCompaniesQuery,
  useGetCreditLimitQuery,
  useGetStatesQuery,
  useGetTownsQuery,
  useLazyGetLastPickupByPhoneQuery,
  useLazyGetTownByIdQuery,
  useLazyGetTownByPostalQuery,
} from '@/store/api';
import { formatMoney } from '@/utils/format';

import {
  checkPickupRules,
  emptyBoxTotal,
  emptyPickupForm,
  fromPickupRecord,
  toNewPickup,
  validatePickup,
  type PickupFormErrors,
  type PickupFormValues,
} from './pickupFormModel';

const timeOptions = (times: string[]) => times.map((t) => ({ value: t, label: t }));
const FROM_OPTIONS = timeOptions(PICKUP_TIMES_FROM);
const TO_OPTIONS = timeOptions(PICKUP_TIMES_TO);
const STATUS_OPTIONS = PICKUP_STATUSES.map((s) => ({ value: s, label: s }));

/** From this window width up, the three sections sit side by side. */
const THREE_COLUMNS = 1000;

const digits = (s: string) => s.replace(/\D/g, '');

type Notice = { type: 'success' | 'error'; text: string } | null;

type Props = {
  /** The pickup to edit, or 0 for a new one. */
  recordId?: number;
  onClose: () => void;
};

/**
 * Pickup form in a pop-up: "New Pick-Up" (recordId 0) or "Edit Pick-Up". Mount it only while
 * open: closing it throws away what was typed.
 */
export function PickupForm({ recordId = 0, onClose }: Props) {
  const theme = useTheme();
  // Always load the latest copy of the record, not a cached one.
  const record = useGetPickupQuery(recordId || skipToken, { refetchOnMountOrArgChange: true });

  if (!recordId) return <PickupFormContent recordId={0} initialValues={emptyPickupForm} onClose={onClose} />;

  if (record.currentData) {
    return (
      <PickupFormContent recordId={recordId} initialValues={fromPickupRecord(record.currentData)} onClose={onClose} />
    );
  }

  // Loading the record, or it failed to load.
  return (
    <FormModal visible title="Edit Pick-Up" onDismiss={onClose} onSubmit={() => {}} submitDisabled>
      <View style={styles.loading}>
        {record.isError ? (
          <>
            <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
              {errorMessage(record.error)}
            </Text>
            <Button mode="outlined" icon="refresh" onPress={record.refetch}>
              Try again
            </Button>
          </>
        ) : (
          <ActivityIndicator accessibilityLabel="Loading pickup" />
        )}
      </View>
    </FormModal>
  );
}

function PickupFormContent({
  recordId,
  initialValues,
  onClose,
}: {
  recordId: number;
  initialValues: PickupFormValues;
  onClose: () => void;
}) {
  const theme = useTheme();
  const wide = useWindowDimensions().width >= THREE_COLUMNS;
  const editing = recordId > 0;
  // Like the web app: picked-up or scheduled pickups can't be changed any more.
  const locked = editing && LOCKED_PICKUP_STATUSES.includes(initialValues.status);

  const [values, setValues] = useState<PickupFormValues>(initialValues);
  const [errors, setErrors] = useState<PickupFormErrors>({});
  const [notice, setNotice] = useState<Notice>(null);
  const [islandCharge, setIslandCharge] = useState<number | null>(null);
  const [askNoDefiniteTime, setAskNoDefiniteTime] = useState(false);

  // Dropdown lists: each loads once its parent is chosen (company -> agent, prefecture -> city -> town).
  const companies = useGetCompaniesQuery();
  const agents = useGetAgentsQuery(values.company || skipToken);
  const states = useGetStatesQuery(JAPAN_COUNTRY_ID);
  const cities = useGetCitiesQuery(values.prefecture || skipToken);
  const towns = useGetTownsQuery(values.city || skipToken);
  const credit = useGetCreditLimitQuery(values.agent || skipToken);
  const [getTownById] = useLazyGetTownByIdQuery();
  const [getTownByPostal] = useLazyGetTownByPostalQuery();
  const [getLastPickup] = useLazyGetLastPickupByPhoneQuery();
  const [addPickup, { isLoading: adding }] = useAddPickupMutation();
  const [updatePickup, { isLoading: updating }] = useUpdatePickupMutation();
  const saving = adding || updating;

  const sagawa = values.forwarder === SAGAWA_FORWARDER_ID;
  const emptyBoxPayable = emptyBoxTotal(values);

  // Credit limit (same as the web app): only matters when pasabay empty boxes are ordered.
  // Near the limit: a warning. At or over it: an error, and saving is blocked.
  const { payable = 0, credit: limit = 0 } = credit.currentData ?? {};
  const creditLevel =
    emptyBoxPayable > 0 && payable !== 0 && limit !== 0 ? (payable < limit ? 'warning' : 'error') : null;

  /** Changes some fields, clearing their errors and any old save message. */
  const update = (changes: Partial<PickupFormValues>) => {
    setValues((v) => ({ ...v, ...changes }));
    setErrors((e) => {
      const next = { ...e };
      for (const key of Object.keys(changes)) delete next[key as keyof PickupFormValues];
      return next;
    });
    setNotice(null);
  };

  /** Island towns cost extra per box: tell the user. */
  const checkIsland = (town: Town | null | undefined) =>
    setIslandCharge(town?.isIsland ? (town.islandCharge ?? 0) : null);

  // --- Field rules (same as the web app) ---

  const changeForwarder = (forwarder: number) =>
    // SAGAWA EXPRESS: never private, and no pasabay empty boxes.
    update(forwarder === SAGAWA_FORWARDER_ID ? { forwarder, isPrivate: false, emptyBoxRegQty: '0' } : { forwarder });

  const changePrivate = (isPrivate: boolean) =>
    // Private pickups are the whole day.
    update(isPrivate ? { isPrivate, timeFrom: PRIVATE_TIME_FROM, timeTo: PRIVATE_TIME_TO } : { isPrivate });

  const changeTown = async (town: number) => {
    update({ town });
    try {
      const details = await getTownById(town, true).unwrap();
      if (details.postalCode) update({ pickupPostal: details.postalCode });
      checkIsland(details);
    } catch {
      // The postal code just isn't filled in; the user can type it.
    }
  };

  /** Postal code typed: fill in prefecture, city and town. */
  const lookUpPostal = async () => {
    const postal = values.pickupPostal.trim();
    if (!postal) return;
    try {
      const town = await getTownByPostal(postal, true).unwrap();
      if (town) {
        update({ prefecture: town.state, city: town.city, town: town.id });
        checkIsland(town);
      }
    } catch {
      // Unknown postal code: the user picks the location by hand.
    }
  };

  /** Phone typed: fill in the empty fields from this client's last pickup. */
  const lookUpPhone = async () => {
    const phone = values.pickupPhone.trim();
    if (!phone) return;
    try {
      const last = await getLastPickup(phone, true).unwrap();
      if (!last) return;
      setValues((v) => ({
        ...v,
        pickupLname: v.pickupLname || last.pickupLname || '',
        pickupFname: v.pickupFname || last.pickupFname || '',
        pickupPostal: v.pickupPostal || last.pickupPostal || '',
        pickupAddress: v.pickupAddress || last.pickupAddress || '',
        ...(v.town === 0 && last.town ? { prefecture: last.prefecture ?? 0, city: last.city ?? 0, town: last.town } : {}),
        ...(v.company === 0 && last.company ? { company: last.company, agent: last.agent ?? 0 } : {}),
      }));
    } catch {
      // New client: nothing to fill in.
    }
  };

  // --- Saving ---

  const submit = () => {
    const found = validatePickup(values);
    if (Object.keys(found).length) {
      setErrors(found);
      setNotice({ type: 'error', text: 'Please check the fields marked in red.' });
      return;
    }
    const problem = checkPickupRules(values);
    if (problem) {
      setNotice({ type: 'error', text: problem });
      return;
    }
    const town = towns.currentData?.find((t) => t.id === values.town);
    if (town?.noDefiniteTime) {
      setAskNoDefiniteTime(true); // Saves on "Continue".
      return;
    }
    save();
  };

  const save = async () => {
    setAskNoDefiniteTime(false);
    try {
      const pickup = toNewPickup(values);
      const { message } = editing
        ? await updatePickup({ id: recordId, pickup }).unwrap()
        : await addPickup(pickup).unwrap();
      if (!/success/i.test(message)) {
        setNotice({ type: 'error', text: message || 'The pickup was not saved.' });
      } else if (editing) {
        onClose(); // The table reloads with the change.
      } else {
        // Like the web app: stay open with an empty form, ready for the next pickup.
        setValues(emptyPickupForm);
        setErrors({});
        setIslandCharge(null);
        setNotice({ type: 'success', text: message });
      }
    } catch (error) {
      setNotice({ type: 'error', text: errorMessage(error) });
    }
  };

  // --- Layout ---

  const footer = notice && (
    <Text
      variant="bodyMedium"
      accessibilityRole="alert"
      style={{ color: notice.type === 'error' ? theme.colors.error : theme.colors.primary }}
    >
      {notice.text}
    </Text>
  );

  return (
    <>
      <FormModal
        visible
        title={editing ? 'Edit Pick-Up' : 'New Pick-Up'}
        onDismiss={onClose}
        onSubmit={submit}
        loading={saving}
        submitDisabled={locked || creditLevel === 'error'}
        footer={footer}
      >
        {locked && (
          <Banner color={theme.colors.error}>
            This pickup is already {initialValues.status} and can no longer be edited.
          </Banner>
        )}
        {creditLevel === 'warning' && (
          <Banner color="#B26A00">
            Please settle your balance before reaching your credit limit. Balance: {formatMoney(payable)}
          </Banner>
        )}
        {creditLevel === 'error' && (
          <Banner color={theme.colors.error}>
            You have reached your credit limit. Your current balance is {formatMoney(payable)}. To continue, bring
            your balance within your credit limit or make a deposit first.
          </Banner>
        )}

        <View style={[styles.sections, wide && styles.sectionsWide]}>
          <Section title="Schedule">
            <TextField label="Tracking #" value={values.trackingNo} disabled />
            <DateField
              label="Date Pick-up"
              value={values.datePickup}
              onChange={(datePickup) => update({ datePickup })}
              error={errors.datePickup}
              disablePast={!editing}
            />
            <View style={styles.switchRow}>
              <Text variant="bodyLarge">Private?</Text>
              <Switch value={values.isPrivate} onValueChange={changePrivate} disabled={sagawa} />
            </View>
            <SelectField
              label="Forwarder"
              value={values.forwarder}
              options={FORWARDERS}
              onChange={changeForwarder}
              error={errors.forwarder}
            />
            <Row>
              <SelectField
                label="From"
                value={values.timeFrom}
                options={FROM_OPTIONS}
                onChange={(timeFrom) => update({ timeFrom })}
                disabled={values.isPrivate}
                error={errors.timeFrom}
              />
              <SelectField
                label="To"
                value={values.timeTo}
                options={TO_OPTIONS}
                onChange={(timeTo) => update({ timeTo })}
                disabled={values.isPrivate}
                error={errors.timeTo}
              />
            </Row>
            <SelectField
              label="Company"
              value={values.company}
              options={toOptions(companies.data)}
              loading={companies.isFetching}
              onChange={(company) => update({ company, agent: 0 })}
              error={errors.company}
              searchable
            />
            <SelectField
              label="Agent"
              value={values.agent}
              options={toOptions(agents.currentData)}
              loading={agents.isFetching}
              disabled={!values.company}
              onChange={(agent) => update({ agent })}
              error={errors.agent}
              searchable
            />
            <TextField
              label="Operator"
              value={values.operator}
              onChangeText={(t) => update({ operator: t.toUpperCase() })}
              autoCapitalize="characters"
            />
          </Section>

          <Section title="Client Details">
            <TextField
              label="Phone #"
              value={values.pickupPhone}
              onChangeText={(t) => update({ pickupPhone: digits(t) })}
              onBlur={lookUpPhone}
              keyboardType="phone-pad"
              error={errors.pickupPhone}
            />
            <Row>
              <TextField
                label="Last Name"
                value={values.pickupLname}
                onChangeText={(t) => update({ pickupLname: t.toUpperCase() })}
                autoCapitalize="characters"
                error={errors.pickupLname}
              />
              <TextField
                label="First Name"
                value={values.pickupFname}
                onChangeText={(t) => update({ pickupFname: t.toUpperCase() })}
                autoCapitalize="characters"
                error={errors.pickupFname}
              />
            </Row>
            <TextField
              label="Postal Code"
              value={values.pickupPostal}
              onChangeText={(pickupPostal) => update({ pickupPostal })}
              onBlur={lookUpPostal}
              keyboardType="numbers-and-punctuation"
              error={errors.pickupPostal}
            />
            <SelectField
              label="Prefecture"
              value={values.prefecture}
              options={toOptions(states.data)}
              loading={states.isFetching}
              onChange={(prefecture) => update({ prefecture, city: 0, town: 0 })}
              error={errors.prefecture}
            />
            <SelectField
              label="City"
              value={values.city}
              options={toOptions(cities.currentData)}
              loading={cities.isFetching}
              disabled={!values.prefecture}
              onChange={(city) => update({ city, town: 0 })}
              error={errors.city}
            />
            <SelectField
              label="Town"
              value={values.town}
              options={toOptions(towns.currentData)}
              loading={towns.isFetching}
              disabled={!values.city}
              onChange={changeTown}
              error={errors.town}
            />
            {islandCharge !== null && (
              <Banner color="#B26A00">
                This area has an Island Charge of {formatMoney(islandCharge)} per box. Please contact our office.
              </Banner>
            )}
            <TextField
              label="Street Address"
              value={values.pickupAddress}
              onChangeText={(t) => update({ pickupAddress: t.toUpperCase() })}
              autoCapitalize="characters"
              multiline
              numberOfLines={3}
              error={errors.pickupAddress}
            />
          </Section>

          <Section title="Pick-Up Details">
            <Row>
              <TextField
                label="Reg (Qty) Pick-Up"
                value={values.pickupBoxRegQty}
                onChangeText={(t) => update({ pickupBoxRegQty: digits(t) })}
                keyboardType="number-pad"
                error={errors.pickupBoxRegQty}
              />
              <TextField
                label="Half (Qty) Pick-Up"
                value={values.pickupBoxHalfQty}
                onChangeText={(t) => update({ pickupBoxHalfQty: digits(t) })}
                keyboardType="number-pad"
                error={errors.pickupBoxHalfQty}
              />
            </Row>
            <Row>
              <TextField
                label="Pasabay Empty Box"
                value={values.emptyBoxRegQty}
                onChangeText={(t) => update({ emptyBoxRegQty: digits(t) })}
                keyboardType="number-pad"
                disabled={sagawa}
                error={errors.emptyBoxRegQty}
              />
              <TextField label="Total Payable (Empty Box)" value={formatMoney(emptyBoxPayable)} disabled />
            </Row>
            <TextField
              label="Memo"
              value={values.memo}
              onChangeText={(t) => update({ memo: t.toUpperCase() })}
              autoCapitalize="characters"
              multiline
              numberOfLines={3}
            />
            <TextField
              label="Japanese"
              value={values.japanese}
              onChangeText={(japanese) => update({ japanese })}
              multiline
              numberOfLines={3}
            />
            <SelectField
              label="Status"
              value={values.status}
              options={STATUS_OPTIONS}
              onChange={(status) => update({ status })}
            />
          </Section>
        </View>
      </FormModal>

      <ConfirmDialog
        visible={askNoDefiniteTime}
        title="No definite time"
        message="This area has no definite pickup time. Do you want to continue?"
        onConfirm={save}
        onCancel={() => setAskNoDefiniteTime(false)}
      />
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
        {title.toUpperCase()}
      </Text>
      {children}
    </View>
  );
}

/** Two fields side by side, equal width. */
function Row({ children }: { children: ReactNode }) {
  return (
    <View style={styles.row}>
      {Children.toArray(children).map((child, i) => (
        <View key={i} style={styles.cell}>
          {child}
        </View>
      ))}
    </View>
  );
}

/** Coloured message box (Paper's Banner can't be coloured per message). */
function Banner({ color, children }: { color: string; children: ReactNode }) {
  return (
    <View style={[styles.banner, { backgroundColor: color }]} accessibilityRole="alert">
      <Text variant="bodyMedium" style={styles.bannerText}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { padding: 48, alignItems: 'center', gap: 12 },
  sections: { gap: 24 },
  sectionsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  section: { flex: 1, gap: 12 },
  sectionTitle: { letterSpacing: 1 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  cell: { flex: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  banner: { borderRadius: 8, padding: 12 },
  bannerText: { color: '#FFFFFF' },
});
