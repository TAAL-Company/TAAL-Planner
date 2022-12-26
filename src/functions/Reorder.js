/* reorder is a custom function that is used to update the order of the items in a list in the example code that I provided. It takes three arguments:

 items: The array of items to be reordered.
 sourceIndex: The index of the item being moved.
 destinationIndex: The index of the location where the item is being dropped

 The function should update the items array so that the item at the sourceIndex is moved to the destinationIndex, and the rest of the items are shifted accordingly.
*/
export const Reorder = (items, sourceIndex, destinationIndex) => {
    const result = Array.from(items);
    const [removed] = result.splice(sourceIndex, 1);
    result.splice(destinationIndex, 0, removed);
    return result;
  };