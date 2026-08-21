import {
  Col,
  Descriptions,
  Empty,
  Image,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";

const { Paragraph, Text, Title } = Typography;

export default function HomeMetadataPreview({ anime }) {
  if (!anime) return null;

  return (
    <>
      {anime.banner_bg_img ? (
        <img
          className="banner"
          src={anime.banner_bg_img}
          alt=""
          referrerPolicy="no-referrer"
        />
      ) : null}

      <Row gutter={[24, 24]}>
        <Col xs={24} md={7} lg={5}>
          {anime.photo ? (
            <Image
              className="poster"
              src={anime.photo}
              alt={anime.title_en || anime.title_native || anime.title_romaji}
              referrerPolicy="no-referrer"
            />
          ) : (
            <Empty description="No poster URL" />
          )}
        </Col>
        <Col xs={24} md={17} lg={19}>
          <Title
            level={4}
            copyable={anime.title_en ? { text: anime.title_en } : false}
          >
            {anime.title_en || "Untitled English title"}
          </Title>
          <Space orientation="vertical" size={0}>
            <Text
              type="secondary"
              copyable={
                anime.title_native ? { text: anime.title_native } : false
              }
            >
              Native Title: {anime.title_native || "-"}
            </Text>
            <Text
              type="secondary"
              copyable={
                anime.title_romaji ? { text: anime.title_romaji } : false
              }
            >
              Romaji Title: {anime.title_romaji || "-"}
            </Text>
          </Space>
          <Descriptions
            className="meta"
            size="small"
            column={{ xs: 1, md: 2, xl: 3 }}
          >
            <Descriptions.Item label="Rating">
              {anime.rating || 0}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {anime.status || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Aired">
              {anime.aired || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Season">
              {anime.season || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              {anime.type || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Studio">
              {anime.studio || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Detected episode total">
              {anime.episode_total ?? "-"}
            </Descriptions.Item>
          </Descriptions>
          <Paragraph>{anime.description || "No description."}</Paragraph>
          <Space size={[6, 6]} wrap>
            {(anime.genres || []).map((genre) => (
              <Tag key={genre}>{genre}</Tag>
            ))}
          </Space>
        </Col>
      </Row>
    </>
  );
}
