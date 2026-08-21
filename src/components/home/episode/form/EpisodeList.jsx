import {
  Button,
  Col,
  Collapse,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
} from "antd";
import {
  DeleteOutlined,
  DownloadOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { isValidEpisodeAiredAt } from "../../../../utils/episodeDate.js";
import { createEmptyEpisode } from "../../../../utils/episodes.js";

export default function EpisodeList({
  episodes,
  onImportClick,
  onExportClick,
}) {
  const nextEpisodeNumber = () => {
    const max = Math.max(
      0,
      ...episodes.map((episode) => Number(episode?.episode_number) || 0),
    );
    return max + 1;
  };

  return (
    <Form.List
      name="episodes"
      rules={[
        {
          validator: async (_, value = []) => {
            const numbers = new Set();
            for (const episode of value) {
              const number = Number(episode?.episode_number);
              if (!Number.isInteger(number) || number <= 0) {
                throw new Error("Episode number must be a positive integer.");
              }
              if (numbers.has(number)) {
                throw new Error("Episode numbers must be unique.");
              }
              numbers.add(number);
            }
          },
        },
      ]}
    >
      {(fields, { add, remove }, { errors }) => (
        <Space direction="vertical" size="middle" className="full-width">
          <Form.ErrorList errors={errors} />
          <Space wrap>
            <Button icon={<UploadOutlined />} onClick={onImportClick}>
              Import Episode Links JSON
            </Button>
            <Button icon={<DownloadOutlined />} onClick={onExportClick}>
              Export Episode Links JSON
            </Button>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() =>
                add({
                  ...createEmptyEpisode(nextEpisodeNumber()),
                })
              }
            >
              Add Episode
            </Button>
          </Space>
          <div className="editor-list-scroll episode-editor-scroll">
            <Collapse
              items={fields.map((field) => ({
                key: field.key,
                label: `Episode ${episodes?.[field.name]?.episode_number || field.name + 1}`,
                extra: (
                  <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={(event) => {
                      event.stopPropagation();
                      remove(field.name);
                    }}
                  />
                ),
                children: (
                  <>
                    <Row gutter={[12, 0]}>
                      <Col xs={24} md={8}>
                        <Form.Item
                          label="Episode Number"
                          name={[field.name, "episode_number"]}
                          rules={[
                            {
                              required: true,
                              message: "Episode number is required.",
                            },
                            {
                              type: "number",
                              min: 1,
                              message:
                                "Episode number must be a positive integer.",
                            },
                          ]}
                        >
                          <InputNumber
                            min={1}
                            precision={0}
                            className="full-width"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          label="Aired At"
                          name={[field.name, "aired_at"]}
                          rules={[
                            {
                              validator: (_, value) =>
                                isValidEpisodeAiredAt(value)
                                  ? Promise.resolve()
                                  : Promise.reject(
                                      new Error(
                                        "Use an ISO 8601 date with timezone, or leave it empty.",
                                      ),
                                    ),
                            },
                          ]}
                        >
                          <Input
                            allowClear
                            placeholder="2026-07-26T00:00:00Z"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          label="Thumbnail URL"
                          name={[field.name, "thumbnail_url"]}
                        >
                          <Input allowClear />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Divider orientation="left">Embed URLs</Divider>
                    <Form.List name={[field.name, "links"]}>
                      {(linkFields, linkOps) => (
                        <Space direction="vertical" className="full-width">
                          {linkFields.map((linkField) => (
                            <Space.Compact
                              key={linkField.key}
                              className="full-width"
                            >
                              <Form.Item
                                name={[linkField.name, "embed_url"]}
                                className="compact-form-item"
                                rules={[
                                  {
                                    required: true,
                                    whitespace: true,
                                    message: "Embed URL is required.",
                                  },
                                ]}
                              >
                                <Input placeholder="https://example.com/embed/..." />
                              </Form.Item>
                              <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => linkOps.remove(linkField.name)}
                              />
                            </Space.Compact>
                          ))}
                          <Button
                            icon={<PlusOutlined />}
                            onClick={() => linkOps.add({ embed_url: "" })}
                          >
                            Add Embed URL
                          </Button>
                        </Space>
                      )}
                    </Form.List>
                  </>
                ),
              }))}
            />
          </div>
        </Space>
      )}
    </Form.List>
  );
}
