import LinkCard from './LinkCard';

export default function LinkGrid({ links, folders, onDelete, onMoveToFolder, userPlan, onTogglePrivacy }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {links.map(link => (
        <LinkCard
          key={link.id}
          link={link}
          folders={folders}
          onDelete={onDelete}
          onMoveToFolder={onMoveToFolder}
          userPlan={userPlan}
          onTogglePrivacy={onTogglePrivacy}
        />
      ))}
    </div>
  );
}
