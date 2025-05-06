import Products from '../models/products.model.js';
import Transaction from '../models/transaction.model.js';

export const dashboardStats = async (req, res) => {
  try {
    const result = await Transaction.aggregate([
      {
        $facet: {
          topSenders: [
            { $group: { _id: "$senderId", totalSent: { $sum: "$amount" } } },
            { $sort: { totalSent: -1 } }, { $limit: 5 }
          ],
          topReceivers: [
            { $group: { _id: "$receiverId", totalReceived: { $sum: "$amount" } } },
            { $sort: { totalReceived: -1 } }, { $limit: 5 }
          ],
          summary: [
            {
              $group: {
                _id: null,
                totalTransactions: { $sum: 1 },
                totalTransferred: { $sum: "$amount" },
                averageTransaction: { $avg: "$amount" }
              }
            }
          ],
          recentTransactions: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 }
          ]
        }
      }
    ]);

    res.status(200).json(result[0]);
  } catch (err) {
    next(err);
  }
};

export const analyzeProducts = async (req, res) => {
  try {
    const analysis = await Products.aggregate([
      {
        $facet: {
          // Top 3 Best-Selling Products
          topSellingProducts: [
            { $sort: { sales: -1 } },
            { $limit: 3 },
            {
              $project: {
                _id: 0,
                name: 1,
                sales: 1,
                price: 1
              }
            }
          ],

          // Category-wise Sales Summary
          categorySalesSummary: [
            {
              $group: {
                _id: "$category",
                totalSales: { $sum: "$sales" },
                averagePrice: { $avg: "$price" },
                productCount: { $sum: 1 }
              }
            },
            { $sort: { totalSales: -1 } }
          ],

          // Price Range Distribution
          priceRanges: [
            {
              $bucket: {
                groupBy: "$price",
                boundaries: [0, 50, 100, 200, 500, 1000],
                default: "Other",
                output: {
                  count: { $sum: 1 },
                  products: {
                    $push: {
                      name: "$name",
                      price: "$price"
                    }
                  }
                }
              }
            }
          ],

          // Recent Products Added in Last 30 Days
          recentProducts: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().setDate(new Date().getDate() - 30))
                }
              }
            },
            { $sort: { createdAt: -1 } },
            {
              $project: {
                _id: 0,
                name: 1,
                createdAt: 1,
                price: 1
              }
            }
          ],

          // Average Rating per Category
          averageRatingPerCategory: [
            {
              $group: {
                _id: "$category",
                averageRating: { $avg: "$rating" }
              }
            },
            { $sort: { averageRating: -1 } }
          ]
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: analysis[0]
    });

  } catch (err) {
    console.error("Aggregation Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to analyze product data",
      error: err.message
    });
  }
};
























const sampleProducts = [
  {
    name: "Smartphone X200",
    category: "Electronics",
    price: 749.99,
    stock: 120,
    sales: 342,
    description: "A high-end smartphone with advanced camera features.",
    rating: 4.5,
    tags: ["smartphone", "android", "camera"],
    createdAt: new Date("2024-12-15T10:30:00Z")
  },
  {
    name: "Running Shoes Pro",
    category: "Footwear",
    price: 129.99,
    stock: 80,
    sales: 215,
    description: "Durable running shoes with breathable fabric.",
    rating: 4.2,
    tags: ["shoes", "fitness", "running"],
    createdAt: new Date("2025-01-20T09:15:00Z")
  },
  {
    name: "Wireless Headphones X1",
    category: "Accessories",
    price: 199.0,
    stock: 65,
    sales: 110,
    description: "Noise-cancelling headphones with 30-hour battery life.",
    rating: 4.7,
    tags: ["audio", "headphones", "wireless"],
    createdAt: new Date("2025-02-01T14:00:00Z")
  },
  {
    name: "Mechanical Keyboard RGB",
    category: "Computers",
    price: 89.5,
    stock: 150,
    sales: 340,
    description: "RGB mechanical keyboard with hot-swappable switches.",
    rating: 4.6,
    tags: ["keyboard", "gaming", "rgb"],
    createdAt: new Date("2025-03-10T11:00:00Z")
  },
  {
    name: "Eco-Friendly Water Bottle",
    category: "Lifestyle",
    price: 24.99,
    stock: 500,
    sales: 620,
    description: "Reusable BPA-free water bottle with insulation.",
    rating: 4.3,
    tags: ["eco", "water bottle", "sustainable"],
    createdAt: new Date("2025-03-30T08:45:00Z")
  }
];

export const insertProducts = async () => {
  try {
    await Products.insertMany(sampleProducts);
    res.status(200).json({ message: 'Sample products added successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to insert products.' });
  }
}