import { Modal, Table, Image } from "antd";
import { getAssetUrl } from "../../../utils/imageUrl.js";

export default function HomeHeaderSearchModalTursoData({
  open,
  onCancel,
  data,
  loading,
  onRowClick,
}) {
  const columns = [
    {
      title: "Photo",
      dataIndex: "photo",
      key: "photo",

      render: (text) =>
        text ? <Image src={getAssetUrl(text)} alt="anime" width={50} /> : "No Image",
    },
    {
      title: "MAL ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Title (EN)",
      dataIndex: "title_en",
      key: "title_en",
    },
  ];

  return (
    <Modal
      title="Turso Anime Data"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
        scroll={{ y: 400 }}
        onRow={(record) => {
          return {
            style: {
              cursor: "pointer",
            },
            onClick() {
              if (onRowClick) onRowClick(record);
            },
          };
        }}
      />
    </Modal>
  );
}
