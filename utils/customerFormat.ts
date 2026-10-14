/**
 * 顧客名の表記を統一する
 */
export function normalizeCustomerName(name: string): string {
  return name
    .replace(/[　\t]+/g, " ")
    .replace(/ +/g, " ")
    .trim();
}

/**
 * 電話番号の全角数字を半角に統一する
 */
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[０-９]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0xFEE0)
  );
}