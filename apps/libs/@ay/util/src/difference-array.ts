export function differenceArray<ORIGINAL, DESTINATION = ORIGINAL>(
  original: ORIGINAL[],
  destination: DESTINATION[],
  identity:
    | (keyof ORIGINAL & keyof DESTINATION)
    | ((a: ORIGINAL, b: DESTINATION) => boolean) = (
    a: ORIGINAL,
    b: DESTINATION,
  ) => a === (b as any),
): {
  create: DESTINATION[];
  remove: ORIGINAL[];
  update: {
    original: ORIGINAL;
    destination: DESTINATION;
  }[];
} {
  destination = destination.slice();
  const create: DESTINATION[] = [];
  const remove: ORIGINAL[] = original.slice();
  const update: { original: ORIGINAL; destination: DESTINATION }[] = [];

  let identityFunc: (a: ORIGINAL, b: DESTINATION) => boolean = (a, b) =>
    a === (b as any);

  if (typeof identity === 'function') {
    identityFunc = identity;
  } else if (typeof identity === 'string') {
    const key = identity as keyof ORIGINAL & keyof DESTINATION;
    identityFunc = (a: ORIGINAL, b: DESTINATION) => a[key] === (b[key] as any);
  }

  destination.map((destItem) => {
    const index = remove.findIndex((oriItem) =>
      identityFunc(oriItem, destItem),
    );

    if (index !== -1) {
      update.push({ destination: destItem, original: remove[index] });
      remove.splice(index, 1);
    } else {
      create.push(destItem);
    }
  });

  return { create, remove, update };
}
