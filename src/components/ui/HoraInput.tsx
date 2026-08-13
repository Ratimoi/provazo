import { TextInput, type TextInputProps } from 'react-native';

function formatarHora(digitos: string): string {
  if (digitos.length <= 2) return digitos;
  return `${digitos.slice(0, 2)}:${digitos.slice(2, 4)}`;
}

/** Campo de horário HH:MM — só aceita dígitos; os dois-pontos são inseridos
 * automaticamente e não podem ser editados, então nunca dá pra digitar um
 * formato inválido. */
export function HoraInput({
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
    const digitos = texto.replace(/\D/g, '').slice(0, 4);
    onChangeText(formatarHora(digitos));
  }

  return (
    <TextInput
      {...props}
      value={value}
      onChangeText={handleChange}
      keyboardType="number-pad"
      maxLength={5}
      placeholder={props.placeholder ?? 'HH:MM'}
    />
  );
}
