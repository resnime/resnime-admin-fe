import { Space, Typography } from "antd";


const { Text } = Typography;

export default function VoiceActorPreview({ voiceActors }) {
  if (!voiceActors.length) {
    return "No voice actors";
  }

  return (
    <Space orientation="vertical" size={8} className="voice-actor-list">
      {voiceActors.map((actor, index) => (
        <Space key={`${actor.name || "voice-actor"}-${index}`} align="start">
          {actor.photo ? (
            <img
              className="voice-actor-img"
              src={actor.photo}
              alt=""
              referrerPolicy="no-referrer"
            />
          ) : null}
          <span>
            {actor.name || "Unnamed voice actor"}
            {actor.country ? (
              <Text type="secondary"> - {actor.country}</Text>
            ) : null}
          </span>
        </Space>
      ))}
    </Space>
  );
}
