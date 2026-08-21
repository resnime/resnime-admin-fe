import { Row, Typography } from "antd";

import HomeMetadataPreview from "./metadata/preview/index.jsx";
import HomeEpisodePreview from "./episode/preview/index.jsx";
import HomeCharacterPreview from "./character/preview/index.jsx";

const { Title } = Typography;

export default function AnimePreview({ anime }) {
  if (!anime?.id) {
    return null;
  }

  const episodes = anime.episodes || [];
  const characters = anime.characters || [];

  return (
    <section className="section">
      <Title level={3}>Preview</Title>
      <HomeMetadataPreview anime={anime} />

      <Row gutter={[16, 16]} className="preview-lists">
        <HomeEpisodePreview episodes={episodes} />
        <HomeCharacterPreview characters={characters} />
      </Row>
    </section>
  );
}
