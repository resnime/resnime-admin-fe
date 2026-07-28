import {
  Alert,
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Space,
  Typography,
  Upload,
  message,
} from "antd";
import { DeleteOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import React from "react";
import {
  EPISODE_LINK_IMPORT_MAX_SIZE,
  EPISODE_LINK_IMPORT_STRATEGY,
  calculateEpisodeImportSummary,
  mergeEpisodeLinks,
  parseEpisodeLinksJson,
} from "../utils/episodeLinksJson.js";
import { isValidEpisodeAiredAt } from "../utils/episodeDate.js";
import { createEmptyEpisode, mergeEpisodeRange } from "../utils/episodes.js";

const { Text } = Typography;

const formatExample = `[
  {
    "episode_number": 1,
    "aired_at": "1999-10-20T00:00:00+00:00",
    "thumbnail_url": null,
    "links": [
      {
        "embed_url": "https://example.com/embed/episode-1"
      }
    ]
  }
]`;

export default function EpisodeEditor({ form }) {
  const episodeTotal = Form.useWatch("episode_total", form);
  const episodes = Form.useWatch("episodes", form) || [];
  const [messageApi, contextHolder] = message.useMessage();
  const [isImportOpen, setIsImportOpen] = React.useState(false);
  const [fileList, setFileList] = React.useState([]);
  const [importResult, setImportResult] = React.useState(null);
  const [strategy, setStrategy] = React.useState(EPISODE_LINK_IMPORT_STRATEGY.MERGE);
  const [isParsing, setIsParsing] = React.useState(false);
  const [isApplying, setIsApplying] = React.useState(false);

  const importSummary = React.useMemo(() => {
    if (!importResult?.ok) return null;
    return calculateEpisodeImportSummary({
      currentEpisodes: episodes,
      importedEpisodes: importResult.episodes,
      duplicateEpisodesMerged: importResult.summary.duplicateEpisodesMerged,
      duplicateLinksRemoved: importResult.summary.duplicateLinksRemoved,
      strategy,
    });
  }, [episodes, importResult, strategy]);

  const generateRange = (start, end) => {
    try {
      form.setFieldValue(
        "episodes",
        mergeEpisodeRange(form.getFieldValue("episodes") || [], start, end),
      );
    } catch (error) {
      messageApi.error(error.message);
    }
  };

  const resetImportState = () => {
    setFileList([]);
    setImportResult(null);
    setStrategy(EPISODE_LINK_IMPORT_STRATEGY.MERGE);
    setIsParsing(false);
    setIsApplying(false);
  };

  const closeImportModal = () => {
    setIsImportOpen(false);
    resetImportState();
  };

  const handleImportFile = async (file) => {
    const isJson =
      file.type === "application/json" ||
      file.name.toLowerCase().endsWith(".json");
    if (!isJson) {
      setFileList([]);
      setImportResult({ ok: false, errors: ["Only JSON files are supported."], warnings: [] });
      return;
    }
    if (file.size > EPISODE_LINK_IMPORT_MAX_SIZE) {
      setFileList([]);
      setImportResult({ ok: false, errors: ["JSON file must be 1 MB or smaller."], warnings: [] });
      return;
    }

    setIsParsing(true);
    setFileList([file]);
    try {
      setImportResult(parseEpisodeLinksJson(await file.text()));
    } catch {
      setImportResult({ ok: false, errors: ["Could not read the selected file."], warnings: [] });
    } finally {
      setIsParsing(false);
    }
  };

  const applyEpisodeLinks = () => {
    if (!importResult?.ok) return;
    setIsApplying(true);
    try {
      const merged = mergeEpisodeLinks({
        currentEpisodes: form.getFieldValue("episodes") || [],
        currentEpisodeTotal: form.getFieldValue("episode_total"),
        importedEpisodes: importResult.episodes,
        strategy,
      });

      form.setFieldsValue({
        episodes: merged.episodes,
        episode_total: merged.episode_total,
      });
      const linkCount = importResult.episodes.reduce(
        (total, episode) => total + episode.links.length,
        0,
      );
      messageApi.success(
        `${importResult.episodes.length} episodes and ${linkCount} streaming links were applied.`,
      );
      closeImportModal();
    } catch {
      messageApi.error("Episode links could not be applied. The current form was kept unchanged.");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Card title="Episodes">
      {contextHolder}
      <Space direction="vertical" size="middle" className="full-width">
        {Number.isInteger(Number(episodeTotal)) && Number(episodeTotal) > 0 ? (
          <Space wrap>
            <Text>Detected episode total: {episodeTotal}</Text>
            <Button onClick={() => generateRange(1, Number(episodeTotal))}>
              Generate Episodes 1-{episodeTotal}
            </Button>
          </Space>
        ) : null}

        <Row gutter={[12, 12]} align="bottom">
          <Col xs={24} sm={8}>
            <Form.Item label="Start Episode" name="episode_range_start">
              <InputNumber min={1} precision={0} className="full-width" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item label="End Episode" name="episode_range_end">
              <InputNumber min={1} precision={0} className="full-width" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Button
              onClick={() =>
                generateRange(
                  form.getFieldValue("episode_range_start"),
                  form.getFieldValue("episode_range_end"),
                )
              }
              className="full-width"
            >
              Generate Range
            </Button>
          </Col>
        </Row>

        <Form.List
          name="episodes"
          rules={[
            {
              validator: async (_, value = []) => {
                const numbers = new Set();
                for (const episode of value) {
                  const number = Number(episode?.episode_number);
                  if (!Number.isInteger(number) || number <= 0) {
                    throw new Error(
                      "Episode number must be a positive integer.",
                    );
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
                <Button
                  icon={<UploadOutlined />}
                  onClick={() => setIsImportOpen(true)}
                >
                  Import Episode Links JSON
                </Button>
                <Button
                  icon={<PlusOutlined />}
                  onClick={() =>
                    add({
                      ...createEmptyEpisode(nextEpisodeNumber(episodes)),
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
      </Space>
      <Modal
        title="Import Episode Links JSON"
        open={isImportOpen}
        onCancel={closeImportModal}
        okText="Apply Episode Links"
        onOk={applyEpisodeLinks}
        okButtonProps={{
          disabled: !importResult?.ok || isParsing,
          loading: isApplying,
        }}
        destroyOnHidden
      >
        <Space direction="vertical" size="middle" className="full-width">
          <Text>
            Upload a JSON file containing episode numbers and streaming links.
            The data will only be applied to the current form.
          </Text>

          <pre className="json-example">{formatExample}</pre>

          <Upload.Dragger
            accept=".json,application/json"
            beforeUpload={(file) => {
              void handleImportFile(file);
              return false;
            }}
            fileList={fileList}
            maxCount={1}
            onRemove={() => {
              setFileList([]);
              setImportResult(null);
            }}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">Click or drag a JSON file here</p>
            <p className="ant-upload-hint">One file, 1 MB maximum.</p>
          </Upload.Dragger>

          <Radio.Group
            value={strategy}
            onChange={(event) => setStrategy(event.target.value)}
            className="full-width"
          >
            <Space direction="vertical" className="full-width">
              <Radio value={EPISODE_LINK_IMPORT_STRATEGY.MERGE}>
                <Space direction="vertical" size={0}>
                  <Text>Merge Links</Text>
                  <Text type="secondary">
                    Add new links to matching episodes while preserving existing
                    links and thumbnails.
                  </Text>
                </Space>
              </Radio>
              <Radio value={EPISODE_LINK_IMPORT_STRATEGY.REPLACE_IMPORTED}>
                <Space direction="vertical" size={0}>
                  <Text>Replace Imported Episode Links</Text>
                  <Text type="secondary">
                    Replace links only for episode numbers included in the JSON
                    file. Other episodes remain unchanged.
                  </Text>
                </Space>
              </Radio>
            </Space>
          </Radio.Group>

          {importResult && !importResult.ok ? (
            <Alert
              type="error"
              showIcon
              message={`${importResult.errors.length} validation error${
                importResult.errors.length === 1 ? "" : "s"
              } found. Showing the first ${Math.min(10, importResult.errors.length)}.`}
              description={
                <ul className="submit-error-list">
                  {importResult.errors.slice(0, 10).map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              }
            />
          ) : null}

          {importResult?.warnings?.length ? (
            <Alert
              type="warning"
              showIcon
              message={`${importResult.warnings.length} warning${
                importResult.warnings.length === 1 ? "" : "s"
              } found.`}
              description={
                <ul className="submit-error-list">
                  {importResult.warnings.slice(0, 10).map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              }
            />
          ) : null}

          {importSummary ? (
            <Alert
              type="success"
              showIcon
              message="Validation summary"
              description={
                <ul className="submit-error-list">
                  {[
                    `File: ${fileList[0]?.name || "-"}`,
                    `Episodes found: ${importSummary.episodesFound}`,
                    `Streaming links found: ${importSummary.streamingLinksFound}`,
                    `Duplicate episodes merged: ${importSummary.duplicateEpisodesMerged}`,
                    `Duplicate links removed: ${importSummary.duplicateLinksRemoved}`,
                    `New episodes to create: ${importSummary.newEpisodesToCreate}`,
                    `Existing episodes to update: ${importSummary.existingEpisodesToUpdate}`,
                    `Highest episode number: ${importSummary.highestEpisodeNumber}`,
                  ].map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              }
            />
          ) : null}
        </Space>
      </Modal>
    </Card>
  );
}

function nextEpisodeNumber(episodes) {
  const max = Math.max(
    0,
    ...episodes.map((episode) => Number(episode?.episode_number) || 0),
  );
  return max + 1;
}
