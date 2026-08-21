import { Row, Typography } from "antd";

import HomeMetadata from "./metadata/index.jsx";
import HomeEpisode from "./episode/index.jsx";
import HomeCharacter from "./character/index.jsx";
import { useHomeCtx } from "../../context/HomeCtxProvider.jsx";

const { Title } = Typography;

export default function AnimePreview() {
  const { formValues: anime } = useHomeCtx();

  if (!anime?.id) {
    return null;
  }

  return (
    <section className="section">
      <Title level={3}>Preview</Title>
      <HomeMetadata />

      <Row gutter={[16, 16]} className="preview-lists">
        <HomeEpisode />

        <HomeCharacter />
      </Row>
    </section>
  );
}
