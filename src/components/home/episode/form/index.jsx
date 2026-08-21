import { Space } from "antd";
import { useState } from "react";
import EpisodeList from "./EpisodeList.jsx";
import EpisodeImportModal from "./EpisodeImportModal.jsx";
import EpisodeExportModal from "./EpisodeExportModal.jsx";
import { useHomeCtx } from "../../../../context/HomeCtxProvider.jsx";

export default function HomeEpisodeForm() {
  const { animeForm: form, formValues } = useHomeCtx();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const episodes = formValues?.episodes || [];

  return (
    <>
      <Space orientation="vertical" size="middle" className="full-width">
        <EpisodeList
          episodes={episodes}
          onImportClick={() => setIsImportOpen(true)}
          onExportClick={() => setIsExportOpen(true)}
        />
      </Space>

      <EpisodeImportModal
        form={form}
        episodes={episodes}
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />

      <EpisodeExportModal
        episodes={episodes}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </>
  );
}
