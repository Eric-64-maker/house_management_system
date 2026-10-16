import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

export default function Approvals() {
  const users = useQuery(api.users.getPendingUsers);
  const houses = useQuery(api.houses.getHouses);

  const approve = useMutation(api.users.approveUser);
  const reject = useMutation(api.users.rejectUser);

  const [houseId, setHouseId] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  if (!users || !houses) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const vacantHouses = houses.filter(
    (house) => house.status === "Vacant"
  );

  async function approveTenant(userId: any) {
    if (!houseId) {
      Alert.alert("Select a house");
      return;
    }

    if (!nationalId || !emergencyContact) {
      Alert.alert("Fill all fields");
      return;
    }

    try {
      await approve({
        userId,
        houseId: houseId as any,
        nationalId,
        emergencyContact,
      });

      Alert.alert(
        "Success",
        "Tenant approved successfully."
      );

      setHouseId("");
      setNationalId("");
      setEmergencyContact("");

    } catch (err) {
      console.log(err);
      Alert.alert("Approval failed");
    }
  }

  async function rejectTenant(id: any) {
    await reject({ id });

    Alert.alert("Tenant rejected.");
  }

  return (
    <FlatList
      style={styles.container}
      data={users}
      keyExtractor={(item) => item._id}
      ListHeaderComponent={
        <Text style={styles.title}>
          Pending Registrations
        </Text>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>

          <Text style={styles.name}>
            {item.name}
          </Text>

          <Text>{item.email}</Text>

          <Text>{item.phone}</Text>

          <TextInput
            style={styles.input}
            placeholder="National ID"
            value={nationalId}
            onChangeText={setNationalId}
          />

          <TextInput
            style={styles.input}
            placeholder="Emergency Contact"
            value={emergencyContact}
            onChangeText={setEmergencyContact}
          />

          <Picker
            selectedValue={houseId}
            onValueChange={(value) =>
              setHouseId(value)
            }
          >
            <Picker.Item
              label="Select House"
              value=""
            />

            {vacantHouses.map((house) => (
              <Picker.Item
                key={house._id}
                label={house.houseNumber}
                value={house._id}
              />
            ))}
          </Picker>

          <View style={styles.row}>

            <TouchableOpacity
              style={styles.approve}
              onPress={() =>
                approveTenant(item._id)
              }
            >
              <Text style={styles.btnText}>
                Approve
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reject}
              onPress={() =>
                rejectTenant(item._id)
              }
            >
              <Text style={styles.btnText}>
                Reject
              </Text>
            </TouchableOpacity>

          </View>

        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  loading:{
    flex:1,
    justifyContent:"center",
    alignItems:"center"
  },

  container:{
    flex:1,
    backgroundColor:"#F5F7FA",
    padding:20
  },

  title:{
    fontSize:30,
    fontWeight:"bold",
    marginTop:45,
    marginBottom:20
  },

  card:{
    backgroundColor:"#fff",
    padding:18,
    borderRadius:15,
    marginBottom:18
  },

  name:{
    fontWeight:"bold",
    fontSize:20,
    marginBottom:6
  },

  input:{
    backgroundColor:"#F9FAFB",
    borderRadius:10,
    padding:12,
    marginTop:12,
    borderWidth:1,
    borderColor:"#ddd"
  },

  row:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginTop:18
  },

  approve:{
    backgroundColor:"#16A34A",
    padding:15,
    borderRadius:10,
    width:"48%"
  },

  reject:{
    backgroundColor:"#DC2626",
    padding:15,
    borderRadius:10,
    width:"48%"
  },

  btnText:{
    color:"#fff",
    textAlign:"center",
    fontWeight:"bold"
  }
});