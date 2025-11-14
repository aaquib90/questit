import TemplateCard from './TemplateCard.jsx';

export default function TemplateCarousel({ collection, onPreview, onUse }) {
  return (
    <div className="relative">
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {collection.templates.map((template) => (
          <div key={template.id} className="w-[85%] min-w-[280px] snap-start sm:w-[48%] xl:w-[32%]">
            <TemplateCard
              template={{ ...template, collectionTitle: collection.title }}
              onPreview={onPreview}
              onUse={onUse}
            />
          </div>
        ))}
      </div>
    </div>
  );
}


