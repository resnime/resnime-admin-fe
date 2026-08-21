import { Space } from "antd";
import { useState } from "react";
import EpisodeRangeGenerator from "./EpisodeRangeGenerator.jsx";
import EpisodeList from "./EpisodeList.jsx";
import EpisodeImportModal from "./EpisodeImportModal.jsx";
import { useHomeCtx } from "../../../../context/HomeCtxProvider.jsx";

export default function HomeEpisodeForm() {
  const { animeForm: form, formValues } = useHomeCtx();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const episodes = formValues?.episodes || [];
  const episodeTotal = formValues?.episode_total;


  return (
    <>
      <Space orientation="vertical" size="middle" className="full-width">
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
    </>
  );
}
