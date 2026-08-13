import { TextInput, type TextInputProps } from 'react-native';

function formatarData(digitos: string): string {
  if (digitos.length <= 4) return digitos;
  if (digitos.length <= 6) return `${digitos.slice(0, 4)}-${digitos.slice(4)}`;
  return `${digitos.slice(0, 4)}-${digitos.slice(4, 6)}-${digitos.slice(6, 8)}`;
}

/** Campo de data AAAA-MM-DD — só aceita dígitos; os hífens são inseridos
 * automaticamente e não podem ser editados, mesma ideia do HoraInput. */
export function DataInput({
  value,
  onChangeText,
  ...props
}: Omit<
  TextInputProps,
  'value' | 'onChangeText' | 'keyboardType' | 'maxLength'
> & {
  value: string;
  onChangeText: (valor: string) => void;
}) {
  function handleChange(texto: string) {
    const digitos = texto.replace(/\D/g, '').slice(0, 8);
    onChangeText(formatarData(digitos));
  }

  return (
    <TextInput
      {...props}
      value={value}
      onChangeText={handleChange}
      keyboardType="number-pad"
      maxLength={10}
      placeholder={props.placeholder ?? 'AAAA-MM-DD'}
    />
  );
}
