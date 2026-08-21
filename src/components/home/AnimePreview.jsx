import { Row, Typography } from "antd";

import HomeMetadata from "./metadata/index.jsx";
import HomeEpisode from "./episode/index.jsx";
import HomeCharacter from "./character/index.jsx";

const { Title } = Typography;

export default function AnimePreview({ anime, form }) {
  if (!anime?.id) {
    return null;
  }

  const episodes = anime.episodes || [];
  const characters = anime.characters || [];

  return (
    <section className="section">
      <Title level={3}>Preview</Title>
      <HomeMetadata anime={anime} form={form} />

      <Row gutter={[16, 16]} className="preview-lists">
        <HomeEpisode
          form={form}
          episodes={episodes}
          episodeTotal={anime.episode_total}
        />
        <HomeCharacter form={form} characters={characters} />
      </Row>
    </section>
  );
}
