import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Reports() {
  const houses = useQuery(api.houses.getHouses);
  const tenants = useQuery(api.tenants.getTenants);
  const bills = useQuery(api.bills.getBills);

  if (
    houses === undefined ||
    tenants === undefined ||
    bills === undefined
  ) {
    return (
      <View style={styles.loading}>
        <Text>Loading Report...</Text>
      </View>
    );
  }

  const occupied = houses.filter(
    (h) => h.status === "Occupied"
  ).length;

  const vacant = houses.filter(
    (h) => h.status === "Vacant"
  ).length;

  const totalRent = houses.reduce(
    (sum, house) => sum + house.rent,
    0
  );

  const paidBills = bills.filter(
    (b) => b.status === "Paid"
  );

  const unpaidBills = bills.filter(
    (b) => b.status === "Unpaid"
  );

  const totalIncome = paidBills.reduce(
    (sum, bill) => sum + bill.total,
    0
  );

  const occupancy =
    houses.length === 0
      ? 0
      : Math.round((occupied / houses.length) * 100);

  const report = [
    { title: "Total Houses", value: houses.length },
    { title: "Occupied Houses", value: occupied },
    { title: "Vacant Houses", value: vacant },
    { title: "Total Tenants", value: tenants.length },
    { title: "Monthly Rent", value: `Ksh ${totalRent}` },
    { title: "Paid Bills", value: paidBills.length },
    { title: "Unpaid Bills", value: unpaidBills.length },
    { title: "Income Collected", value: `Ksh ${totalIncome}` },
    { title: "Occupancy Rate", value: `${occupancy}%` },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Property Report</Text>

      {report.map((item) => (
        <View key={item.title} style={styles.card}>
          <Text style={styles.cardTitle}>
            {item.title}
          </Text>

          <Text style={styles.cardValue}>
            {item.value}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 45,
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 17,
    color: "#666",
  },

  cardValue: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: "bold",
    color: "#2563EB",
  },
});