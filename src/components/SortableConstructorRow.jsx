import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ConstructorRow from './ConstructorRow';
const SortableConstructorRow = ({ item, id, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ConstructorRow
        item={item}
        type="filling"
        isLocked={false}
        onRemove={() => onRemove(item.uniqueId)}
        dragListeners={listeners}
      />
    </div>
  );
};

export default SortableConstructorRow;