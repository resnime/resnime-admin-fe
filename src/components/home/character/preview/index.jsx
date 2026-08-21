import { Card, Col, List } from "antd";
import VoiceActorPreview from "../../VoiceActorPreview.jsx";

export default function HomeCharacterPreview({ characters = [] }) {
  return (
    <Col xs={24} lg={12}>
      <Card title="Characters">
        <div className="character-preview-scroll">
          <List
            locale={{ emptyText: "No characters found" }}
            dataSource={characters}
            renderItem={(character) => (
              <List.Item align="top">
                <List.Item.Meta
                  avatar={
                    character.photo ? (
                      <img
                        className="avatar-img"
                        src={character.photo}
                        alt=""
                        referrerPolicy="no-referrer"
                      />
                    ) : null
                  }
                  title={`${character.name || "Unnamed character"}${character.role ? ` - ${character.role}` : ""}`}
                  description={
                    <VoiceActorPreview
                      voiceActors={character.voice_actors || []}
                    />
                  }
                />
              </List.Item>
            )}
          />
        </div>
      </Card>
    </Col>
  );
}
