import { Alert, Modal, Radio, Space, Typography, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState, useMemo } from "react";
import {
  EPISODE_LINK_IMPORT_MAX_SIZE,
  EPISODE_LINK_IMPORT_STRATEGY,
  calculateEpisodeImportSummary,
  mergeEpisodeLinks,
  parseEpisodeLinksJson,
} from "../../../utils/episodeLinksJson.js";

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

export default function EpisodeImportModal({ form, episodes, isOpen, onClose }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [fileList, setFileList] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const [strategy, setStrategy] = useState(EPISODE_LINK_IMPORT_STRATEGY.MERGE);
  const [isParsing, setIsParsing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const importSummary = useMemo(() => {
    if (!importResult?.ok) return null;
    return calculateEpisodeImportSummary({
      currentEpisodes: episodes,
      importedEpisodes: importResult.episodes,
      duplicateEpisodesMerged: importResult.summary.duplicateEpisodesMerged,
      duplicateLinksRemoved: importResult.summary.duplicateLinksRemoved,
      strategy,
    });
  }, [episodes, importResult, strategy]);

  const resetImportState = () => {
    setFileList([]);
    setImportResult(null);
    setStrategy(EPISODE_LINK_IMPORT_STRATEGY.MERGE);
    setIsParsing(false);
    setIsApplying(false);
  };

  const handleClose = () => {
    onClose();
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
      handleClose();
    } catch {
      messageApi.error("Episode links could not be applied. The current form was kept unchanged.");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Import Episode Links JSON"
        open={isOpen}
        onCancel={handleClose}
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
    </>
  );
}
