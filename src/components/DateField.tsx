import { StyleSheet, View } from 'react-native';
import { HelperText } from 'react-native-paper';
import { DatePickerInput, en, registerTranslation } from 'react-native-paper-dates';

registerTranslation('en', en);

type Props = {
  label: string;
  /** Date as 'YYYY-MM-DD', or '' when empty. */
  value: string;
  onChange: (value: string) => void;
  error?: string | false | null;
  /** Don't allow dates before today. */
  disablePast?: boolean;
  disabled?: boolean;
};

/** 'YYYY-MM-DD' in local time (not UTC, which can shift the day). */
const toIsoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const fromIsoDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return y && m && d ? new Date(y, m - 1, d) : undefined;
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/** Date text field with a calendar button; type the date or pick it from the calendar. */
export function DateField({ label, value, onChange, error, disablePast = false, disabled = false }: Props) {
  return (
    <View style={styles.field}>
      <DatePickerInput
        locale="en"
        label={label}
        mode="outlined"
        inputMode="start"
        value={value ? fromIsoDate(value) : undefined}
        onChange={(d) => onChange(d ? toIsoDate(d) : '')}
        validRange={disablePast ? { startDate: startOfToday() } : undefined}
        hasError={!!error}
        disabled={disabled}
        presentationStyle="pageSheet"
      />
      {!!error && (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // DatePickerInput reserves room for its own validation message; keep the field from stretching.
  field: { flexGrow: 0 },
});
