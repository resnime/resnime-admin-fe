import { Card, Space } from "antd";
import { useState } from "react";
import EpisodeRangeGenerator from "./EpisodeRangeGenerator.jsx";
import EpisodeList from "./EpisodeList.jsx";
import EpisodeImportModal from "./EpisodeImportModal.jsx";

export default function EpisodeEditor({ form, episodeTotal, episodes }) {
  const [isImportOpen, setIsImportOpen] = useState(false);

  return (
    <Card title="Episodes">
      <Space direction="vertical" size="middle" className="full-width">
        <EpisodeRangeGenerator form={form} episodeTotal={episodeTotal} />
        
        <EpisodeList 
          episodes={episodes} 
          onImportClick={() => setIsImportOpen(true)} 
        />
      </Space>

      <EpisodeImportModal 
        form={form} 
        episodes={episodes} 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
      />
    </Card>
  );
}
