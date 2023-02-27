export function updateUndefinedFromDefaults(componentInstance, changes, defaultEntries) {
    defaultEntries.forEach(({ key, value }) => {
        if (changes[key] && changes[key].currentValue === undefined) {
            componentInstance[key] = value;
        }
    });
}
