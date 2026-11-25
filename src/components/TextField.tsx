import type { ComponentProps } from 'react';
import { View } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';

type Props = Omit<ComponentProps<typeof TextInput>, 'error' | 'mode'> & {
  /** Error text under the field; also outlines the field in red. */
  error?: string | false | null;
};

/** Outlined text field with its error message underneath. */
export function TextField({ error, ...props }: Props) {
  return (
    <View>
      <TextInput mode="outlined" error={!!error} {...props} />
      {!!error && (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      )}
    </View>
  );
}
