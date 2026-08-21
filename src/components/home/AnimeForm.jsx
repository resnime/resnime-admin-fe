import { Divider, Space } from "antd";

import HomeMetadataForm from "./metadata/form/index.jsx";
import HomeEpisodeForm from "./episode/form/index.jsx";
import HomeCharacterForm from "./character/form/index.jsx";

export default function AnimeForm({ form, formValues, metadataExtra = null }) {
  return (
    <section className="section">
      <Divider orientation="left">Editable Anime Form</Divider>

      <Space orientation="vertical" size="large" className="full-width">
        <HomeMetadataForm form={form} metadataExtra={metadataExtra} />

        <HomeEpisodeForm
          form={form}
          episodeTotal={formValues?.episode_total}
          episodes={formValues?.episodes || []}
        />

        <HomeCharacterForm form={form} />
      </Space>
    </section>
  );
}
