// Danh sách món ăn dùng chung cho Menu và Order waiter
export interface MenuItem {
  name: string;
  price: number;
  description: string;
  image: string;
}

const menuData: MenuItem[] = [
  {
    name: "Cơm Tấm Sườn Nướng",
    price: 65000,
    description: "Cơm tấm thơm ngon với sườn nướng đậm đà",
    image: "https://i1-giadinh.vnecdn.net/2024/03/07/7-Hoan-thien-thanh-pham-1-6244-1709800134.jpg?w=1020&h=0&q=100&dpr=1&fit=crop&s=Y03-BsY4ORbpVkG4zm_DcA"
  },
  {
    name: "Bánh Xèo Miền Tây",
    price: 45000,
    description: "Bánh xèo giòn tan với nhân tôm thịt đầy đặn",
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
  },
  {
    name: "Lẩu Cá Kèo",
    price: 180000,
    description: "Lẩu cá kèo chua cay đặc sản miền Tây",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
  },
  {
    name: "Gỏi Cuốn Tôm Thịt",
    price: 35000,
    description: "Gỏi cuốn tươi mát với tôm thịt tươi ngon",
    image: "https://images.unsplash.com/photo-1539136788836-5699e78bfc75?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
  },
  {
    name: "Phở Bò",
    price: 50000,
    description: "Món phở nổi tiếng với nước dùng thơm ngon và thịt bò mềm",
    image: "https://giavichinsu.com/wp-content/uploads/2024/01/cach-nau-pho-bo.jpg"
  },
  {
    name: "Bún Chả Hà Nội",
    price: 60000,
    description: "Bún chả nướng thơm, nước mắm pha đặc trưng",
    image: "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2024_1_12_638406880045931692_cach-lam-bun-cha-ha-noi-0.jpg"
  },
  {
    name: "Chả Cá Lã Vọng",
    price: 120000,
    description: "Món chả cá thơm ngon, ăn kèm với bún và rau sống",
    image: "https://file.hstatic.net/200000700229/article/lam-cha-ca-la-vong-bang-noi-chien-khong-dau_7e476b1bfcff43428bc8af05fd931d74.jpeg"
  },
  {
    name: "Mì Quảng",
    price: 55000,
    description: "Mì Quảng đặc sản miền Trung, thơm ngon với nước dùng đặc trưng",
    image: "https://danangfantasticity.com/wp-content/uploads/2024/04/cach-thuong-thuc-mot-to-mi-quang-dung-dieu-nguoi-da-nang.jpg"
  },
  {
    name: "Bánh Mì Thịt Nướng",
    price: 30000,
    description: "Bánh mì thơm ngon, thịt nướng giòn ngọt",
    image: "https://cdn.tgdd.vn/Files/2021/08/20/1376583/cach-lam-banh-mi-thit-nuong-cuc-don-gian-bang-chai-nhua-co-san-tai-nha-202108201640593483.jpg"
  },
  {
    name: "Bánh Cuốn Hà Nội",
    price: 45000,
    description: "Bánh cuốn nóng hổi, nhân thịt heo thơm lừng",
    image: "https://static.tuoitre.vn/tto/i/s626/2013/05/08/DxofPVKe.jpg"
  },
  {
    name: "Cơm Gà Hội An",
    price: 70000,
    description: "Cơm gà thơm ngon, đậm đà với nước mắm, rau sống",
    image: "https://i-giadinh.vnecdn.net/2023/04/22/Buoc-11-thanh-pham-1-11-9981-1682135995.jpg"
  },
  {
    name: "Xôi Xéo",
    price: 40000,
    description: "Xôi xéo với đậu xanh, mỡ hành thơm lừng",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLXHCgHafFLTjysi9B5c1qDkgbYs_ef_qGvw&s"
  }
];

export default menuData;
