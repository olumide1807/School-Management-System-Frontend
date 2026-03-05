//Format value with comma and add Naira sign
export const toCurrency = (number: number, country = "en-NG") => {
  const formatter = new Intl.NumberFormat(country, {
    style: "currency",
    currency: country === "en-NG" ? "NGN" : "GBP",
  });

  return formatter.format(number).split(".00")[0];
};

export const capitalize = (value: string) => {
  const valArr = value.split("");
  const firstLetter = valArr.shift();
  return [firstLetter?.toUpperCase(), ...valArr].join("");
};

export function filterItem(
  items: Array<{ id: string; name: string }>,
  id: string,
  byName: boolean
) {
  if (!byName) {
    return items.filter((item) => item.id !== id);
  }
  return items.filter((item) => item.name === id);
}

export function objLen(object: any) {
  let i = 0;
  // for (const key in object) {
  //   i++;
  // }
  for (const _key in object) {
    i++;
  }
  return i;
}
