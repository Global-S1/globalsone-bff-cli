export interface NamingVariants {
  pascal: string;
  camel: string;
  kebab: string;
  snake: string;
  constant: string;
  original: string;
}

export const toNamingVariants = (input: string): NamingVariants => {
  const words = input
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const pascal = words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  const camel = words
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('');

  const kebab = words.join('-');
  const snake = words.join('_');
  const constant = words.join('_').toUpperCase();

  return {
    pascal,
    camel,
    kebab,
    snake,
    constant,
    original: input
  };
};
