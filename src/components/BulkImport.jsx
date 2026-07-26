import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  Image,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
} from "antd";
import {
  CheckSquareOutlined,
  ClearOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import React, { useState } from "react";
import AnimeForm from "./AnimeForm.jsx";
import AnimePreview from "./AnimePreview.jsx";
import { bulkUpsertAnime, submitAnimeToTurso } from "../services/animeApi.js";
import {
  BULK_STORAGE_KEY,
  emptyBulkAnime,
  normalizeBulkItem,
  normalizeBulkUploadItems,
  parseStoredBulkItems,
  stripBulkMetadata,
} from "../utils/bulkImport.js";

const { Dragger } = Upload;
const { Paragraph, Text } = Typography;

function readStoredItems() {
  if (typeof localStorage === "undefined") return [];
  return parseStoredBulkItems(localStorage.getItem(BULK_STORAGE_KEY) || "[]");
}

export default function BulkImport({ messageApi }) {
  const [bulkForm] = Form.useForm();
  const [items, setItems] = useState(readStoredItems);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [previewAnime, setPreviewAnime] = useState(emptyBulkAnime);
  const [uploadReport, setUploadReport] = useState(null);
  const [rowLoadingId, setRowLoadingId] = useState(null);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [reviewDirty, setReviewDirty] = useState(false);

  const activeItem = items.find((item) => item.id === activeId);

  const saveItems = (nextItems) => {
    setItems(nextItems);
    try {
      localStorage.setItem(BULK_STORAGE_KEY, JSON.stringify(nextItems));
    } catch {
      messageApi.error(
        "Bulk data could not be saved to localStorage. It will stay in memory until this page closes.",
      );
    }
  };

  const openReview = (item) => {
    const normalized = normalizeBulkItem(item);
    setActiveId(item.id);
    bulkForm.setFieldsValue(normalized);
    setPreviewAnime(normalized);
    setReviewDirty(false);
  };

  const backToList = () => {
    if (!reviewDirty) {
      setActiveId(null);
      return;
    }

    Modal.confirm({
      title: "Discard unsaved bulk changes?",
      content:
        "Changes in this form are not saved until Update Bulk Data is clicked.",
      okText: "Discard",
      cancelText: "Stay",
      onOk: () => setActiveId(null),
    });
  };

  const updateActiveItem = async () => {
    await bulkForm.validateFields();
    const values = normalizeBulkItem(bulkForm.getFieldsValue(true));
    const id = activeId;
    const nextItems = items.map((item) =>
      item.id === id
        ? {
            ...values,
            id,
            import_status: item.import_status,
          }
        : item,
    );
    saveItems(nextItems);
    setPreviewAnime(values);
    setReviewDirty(false);
    setActiveId(null);
    messageApi.success("Bulk data updated.");
  };

  const handleUpload = async (file) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        messageApi.error("JSON root must be an array.");
        return Upload.LIST_IGNORE;
      }

      const result = normalizeBulkUploadItems(parsed, items);
      saveItems(result.items);
      setSelectedRowKeys((keys) =>
        keys.filter((key) => result.items.some((item) => item.id === key)),
      );
      setUploadReport(result);
      messageApi.success(
        `${result.summary.added} added, ${result.summary.updated} updated, ${result.summary.invalidSkipped} invalid skipped.`,
      );
    } catch {
      messageApi.error("JSON file could not be parsed. Existing bulk data was kept.");
    }

    return Upload.LIST_IGNORE;
  };

  const clearData = () => {
    Modal.confirm({
      title: "Clear all bulk import data?",
      content:
        "This will remove all uploaded anime, review progress, edited data, selection, and import statuses from this browser. Data already stored in Turso will not be deleted.",
      okText: "Clear Data",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: () => {
        saveItems([]);
        localStorage.removeItem(BULK_STORAGE_KEY);
        setSelectedRowKeys([]);
        setActiveId(null);
        setUploadReport(null);
      },
    });
  };

  const applyResults = (results) => {
    const succeededIds = new Set(
      results.filter((result) => result.success).map((result) => result.anime_id),
    );
    const failedIds = new Set(
      results
        .filter((result) => !result.success && result.anime_id)
        .map((result) => result.anime_id),
    );
    const nextItems = items.map((item) => {
      if (succeededIds.has(item.id)) {
        return { ...item, is_reviewed: false, import_status: "imported" };
      }
      if (failedIds.has(item.id)) {
        return { ...item, is_reviewed: true, import_status: "failed" };
      }
      return item;
    });

    saveItems(nextItems);
    setSelectedRowKeys([]);
    return { failedIds: [...failedIds] };
  };

  const insertOne = (item) => {
    Modal.confirm({
      title: `${buttonLabel(item)} anime to Turso?`,
      content:
        "The current reviewed data will replace episodes, embed links, characters, and voice actors for this MAL ID.",
      okText: buttonLabel(item),
      cancelText: "Cancel",
      onOk: async () => {
        setRowLoadingId(item.id);
        try {
          await submitAnimeToTurso(stripBulkMetadata(item));
          applyResults([{ anime_id: item.id, success: true }]);
          messageApi.success(`${displayTitle(item)} imported successfully.`);
        } catch (error) {
          applyResults([{ anime_id: item.id, success: false }]);
          showSubmitError(error);
        } finally {
          setRowLoadingId(null);
        }
      },
    });
  };

  const insertSelected = () => {
    const selectedItems = items.filter((item) =>
      selectedRowKeys.includes(item.id),
    );
    Modal.confirm({
      title: "Insert selected anime to Turso?",
      content: `${selectedItems.length} anime will be processed. New MAL IDs will be created. Existing MAL IDs will be updated.`,
      okText: "Insert Selected",
      cancelText: "Cancel",
      onOk: async () => {
        setBulkSubmitting(true);
        try {
          const response = await bulkUpsertAnime(selectedItems.map(stripBulkMetadata));
          const { failedIds } = applyResults(response.results);
          const summary = response.summary;
          if (failedIds.length) {
            messageApi.warning(
              `${summary.succeeded} anime imported successfully. ${summary.failed} anime failed: ${failedIds.join(", ")}.`,
            );
          } else {
            messageApi.success(
              `${summary.succeeded} anime imported successfully (${summary.created} created, ${summary.updated} updated).`,
            );
          }
        } catch (error) {
          messageApi.error(error.message);
        } finally {
          setBulkSubmitting(false);
        }
      },
    });
  };

  const showSubmitError = (error) => {
    if (error.details?.length) {
      Modal.error({
        title: error.message,
        content: (
          <ul className="submit-error-list">
            {error.details.map((detail) => (
              <li key={`${detail.field}-${detail.message}`}>
                <strong>{detail.field}</strong>: {detail.message}
              </li>
            ))}
          </ul>
        ),
      });
      return;
    }

    messageApi.error(error.message);
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "photo",
      width: 86,
      render: (photo) =>
        photo ? (
          <Image
            src={photo}
            width={48}
            height={64}
            className="table-poster"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="table-poster-placeholder" />
        ),
    },
    { title: "MAL ID", dataIndex: "id", width: 110 },
    {
      title: "Title",
      render: (_, item) => (
        <Space direction="vertical" size={0}>
          <Text strong>{displayTitle(item)}</Text>
          {item.title_en && item.title_en !== displayTitle(item) ? (
            <Text type="secondary">{item.title_en}</Text>
          ) : null}
        </Space>
      ),
    },
    {
      title: "Review Status",
      width: 140,
      render: (_, item) => (
        <Tag color={item.is_reviewed ? "green" : "default"}>
          {item.is_reviewed ? "Reviewed" : "Not Reviewed"}
        </Tag>
      ),
    },
    {
      title: "Import Status",
      width: 140,
      render: (_, item) => (
        <Tag color={statusColor(item.import_status)}>
          {statusLabel(item.import_status)}
        </Tag>
      ),
    },
    {
      title: "Actions",
      width: 260,
      render: (_, item) => (
        <Space wrap>
          <Button icon={<EditOutlined />} onClick={() => openReview(item)}>
            Review/Edit
          </Button>
          <Button
            type="primary"
            icon={<DatabaseOutlined />}
            disabled={!item.is_reviewed}
            loading={rowLoadingId === item.id}
            onClick={() => insertOne(item)}
          >
            {buttonLabel(item)}
          </Button>
        </Space>
      ),
    },
  ];

  if (activeItem) {
    return (
      <section className="section">
        <Space className="bulk-review-actions" wrap>
          <Button icon={<RollbackOutlined />} onClick={backToList}>
            Back to Bulk List
          </Button>
          <Button onClick={() => setPreviewAnime(bulkForm.getFieldsValue(true))}>
            Update Preview
          </Button>
          <Button
            type="primary"
            icon={<CheckSquareOutlined />}
            onClick={updateActiveItem}
          >
            Update Bulk Data
          </Button>
        </Space>
        <Form
          form={bulkForm}
          layout="vertical"
          onValuesChange={() => setReviewDirty(true)}
        >
          <AnimePreview anime={previewAnime} />
          <AnimeForm form={bulkForm} mode="bulk" />
        </Form>
      </section>
    );
  }

  return (
    <section className="section">
      <Space direction="vertical" size="large" className="full-width">
        <Card>
          <Dragger
            accept=".json,application/json"
            multiple={false}
            beforeUpload={handleUpload}
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Upload JSON bulk anime</p>
            <p className="ant-upload-hint">
              Upload only stores review data in this browser. It does not insert
              to Turso.
            </p>
          </Dragger>
        </Card>

        {uploadReport ? <UploadSummary report={uploadReport} /> : null}

        {items.length ? (
          <>
            <Space className="bulk-toolbar" wrap>
              <Summary items={items} />
              <Button
                icon={<CheckSquareOutlined />}
                onClick={() =>
                  setSelectedRowKeys(
                    items.filter((item) => item.is_reviewed).map((item) => item.id),
                  )
                }
              >
                Select All Reviewed
              </Button>
              <Button icon={<ClearOutlined />} onClick={() => setSelectedRowKeys([])}>
                Clear Selection
              </Button>
              <Button
                type="primary"
                icon={<DatabaseOutlined />}
                loading={bulkSubmitting}
                disabled={!selectedRowKeys.length}
                onClick={insertSelected}
              >
                Insert Selected ({selectedRowKeys.length}) to Turso
              </Button>
              <Button danger icon={<DeleteOutlined />} onClick={clearData}>
                Clear Data
              </Button>
            </Space>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={items}
              pagination={{ pageSize: 20, showSizeChanger: true }}
              scroll={{ x: 980 }}
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys,
                getCheckboxProps: (item) => ({
                  disabled: item.is_reviewed !== true,
                }),
              }}
            />
          </>
        ) : (
          <Empty description="No bulk data yet" />
        )}
      </Space>
    </section>
  );
}

function UploadSummary({ report }) {
  const { summary, skipped } = report;
  return (
    <Alert
      type={
        summary.invalidSkipped ||
        summary.duplicateSkipped ||
        summary.reviewedSkipped
          ? "warning"
          : "success"
      }
      showIcon
      message={`${summary.added} added, ${summary.updated} updated, ${summary.reviewedSkipped} reviewed skipped, ${summary.invalidSkipped} invalid skipped, ${summary.duplicateSkipped} duplicate skipped`}
      description={
        skipped.length
          ? skipped
              .map((item) => `${item.anime_id || `index ${item.index}`}: ${item.reason}`)
              .join("; ")
          : null
      }
    />
  );
}

function Summary({ items }) {
  const counts = items.reduce(
    (total, item) => {
      total.reviewed += item.is_reviewed ? 1 : 0;
      total.imported += item.import_status === "imported" ? 1 : 0;
      total.failed += item.import_status === "failed" ? 1 : 0;
      return total;
    },
    { reviewed: 0, imported: 0, failed: 0 },
  );

  return (
    <Paragraph className="bulk-summary">
      Total anime: <Text strong>{items.length}</Text> · Reviewed:{" "}
      <Text strong>{counts.reviewed}</Text> · Not Reviewed:{" "}
      <Text strong>{items.length - counts.reviewed}</Text> · Imported:{" "}
      <Text strong>{counts.imported}</Text> · Failed:{" "}
      <Text strong>{counts.failed}</Text>
    </Paragraph>
  );
}

function displayTitle(item) {
  return item.title_romaji || item.title_en || "Untitled";
}

function buttonLabel(item) {
  if (item.import_status === "imported") return "Update Turso";
  if (item.import_status === "failed") return "Retry";
  return "Insert";
}

function statusLabel(status) {
  if (status === "imported") return "Imported";
  if (status === "failed") return "Failed";
  return "Not Imported";
}

function statusColor(status) {
  if (status === "imported") return "blue";
  if (status === "failed") return "red";
  return "default";
}
