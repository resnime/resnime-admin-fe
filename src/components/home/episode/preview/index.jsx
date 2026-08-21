import { List, Typography } from "antd";

const { Text } = Typography;

export default function HomeEpisodePreview({ episodes = [] }) {
  return (
    <div className="episode-preview-scroll">
      <List
        locale={{ emptyText: "No episodes created yet" }}
        dataSource={episodes}
        renderItem={(episode) => (
          <List.Item>
            <Text>Episode {episode.episode_number}</Text>
            <Text type="secondary">
              {(episode.links || []).length} embed URL
            </Text>
          </List.Item>
        )}
      />
    </div>
  );
}
