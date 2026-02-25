import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Linking,
  Image,
} from 'react-native';
import { useState } from 'react';

// ---------- RPC helpers ----------
const RPC = 'https://api.mainnet-beta.solana.com';

const rpc = async (method: string, params: any[]) => {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
};

const getBalance = async (addr: string) => {
  const result = await rpc('getBalance', [addr]);
  return result.value / 1_000_000_000;
};

const getTokens = async (addr: string) => {
  const result = await rpc('getTokenAccountsByOwner', [
    addr,
    { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
    { encoding: 'jsonParsed' },
  ]);
  return (result.value || [])
    .map((a: any) => ({
      mint: a.account.data.parsed.info.mint,
      amount: a.account.data.parsed.info.tokenAmount.uiAmount,
    }))
    .filter((t: any) => t.amount > 0);
};

const getTxns = async (addr: string) => {
  const sigs = await rpc('getSignaturesForAddress', [addr, { limit: 10 }]);
  return sigs.map((s: any) => ({
    sig: s.signature,
    time: s.blockTime,
    ok: !s.err,
  }));
};

const short = (s: string, n = 4) => `${s.slice(0, n)}...${s.slice(-n)}`;

const timeAgo = (ts: number) => {
  const diff = Math.floor(Date.now() / 1000 - ts);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function App() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [tokens, setTokens] = useState<any[]>([]);
  const [txns, setTxns] = useState<any[]>([]);

  const search = async () => {
    const addr = address.trim();
    if (!addr) return Alert.alert('Enter a wallet address');
    setLoading(true);
    try {
      const [bal, tok, tx] = await Promise.all([
        getBalance(addr),
        getTokens(addr),
        getTxns(addr),
      ]);
      setBalance(bal);
      setTokens(tok);
      setTxns(tx);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setLoading(false);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.scroll}>
          <TextInput
            style={s.input}
            placeholder="Solana wallet address..."
            placeholderTextColor="#555"
            value={address}
            onChangeText={setAddress}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={s.btn} onPress={search} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={s.btnText}>Search</Text>
            )}
          </TouchableOpacity>

          {balance !== null && (
            <View style={s.card}>
              <Text style={s.label}>SOL Balance</Text>
              <Text style={s.balance}>{balance.toFixed(4)}</Text>
              <Text style={s.sol}>SOL</Text>
              <Text style={s.addr}>{short(address.trim(), 6)}</Text>
            </View>
          )}

          {/* Token List */}
          <FlatList
            data={tokens}
            keyExtractor={(t) => t.mint}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={s.row}>
                <Text style={s.mint}>{short(item.mint, 6)}</Text>
                <Text style={s.amount}>{item.amount}</Text>
              </View>
            )}
          />

          {/* Transaction List */}
          <FlatList
            data={txns}
            keyExtractor={(t) => t.sig}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={s.row}
                onPress={() => Linking.openURL(`https://solscan.io/tx/${item.sig}`)}
              >
                <Text style={s.mint}>{short(item.sig, 6)}</Text>
                <Text style={s.amount}>{timeAgo(item.time)}</Text>
              </TouchableOpacity>
            )}
          />

          <StatusBar style="auto" />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  logo: {
    height: 10,
    width: 10,
  },
  safe: { flex: 1, backgroundColor: '#0a0a1a' },
  scroll: { padding: 16 },
  input: {
    backgroundColor: '#1e1e2e',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: '#14F195',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  card: {
    backgroundColor: '#0f0f23',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  label: { color: '#aaa', fontSize: 14 },
  balance: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  sol: { color: '#aaa', fontSize: 14 },
  addr: { color: '#777', fontSize: 12, marginTop: 4 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f0f23',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  mint: { color: '#fff' },
  amount: { color: '#14F195' },
});