import { List } from "antd";
import VoiceActorPreview from "../../VoiceActorPreview.jsx";
import { useHomeCtx } from "../../../../context/HomeCtxProvider.jsx";
import { getAssetUrl } from "../../../../utils/imageUrl.js";

export default function HomeCharacterPreview() {
  const { formValues } = useHomeCtx();
  const characters = formValues?.characters || [];

  return (
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
                    src={getAssetUrl(character.photo)}
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
  );
}
