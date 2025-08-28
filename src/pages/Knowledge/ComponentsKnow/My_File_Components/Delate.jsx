export const handleRemoveItem = () => {
    return (
            handleRemoveItem = (id) => {
            setItems(prev => prev.filter(item => item.id !== id));
            setFavorites(prev => prev.filter(favId => favId !== id));
          }
    );
}

export default handleRemoveItem;