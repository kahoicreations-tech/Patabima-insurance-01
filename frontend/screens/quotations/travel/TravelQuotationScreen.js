import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BRAND, UI, SEMANTIC, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../../theme';
import { Heading4, Body1, Body2, Subtitle2, ButtonText } from '../../../components/typography/Text';
import api from '../../../services/DjangoAPIService';

// Travel Insurance quotation screen (7 fields)
export default function TravelQuotationScreen({ navigation }) {
  const [clientName, setClientName] = useState('');
  const [travelersAge, setTravelersAge] = useState('');
  const [destination, setDestination] = useState('');
  const [purposeOfTravel, setPurposeOfTravel] = useState(null);
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [preferredUnderwriters, setPreferredUnderwriters] = useState([]);
  const [underwriters, setUnderwriters] = useState([]);
  const [underwritersLoading, setUnderwritersLoading] = useState(false);
  const [underwritersError, setUnderwritersError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Static purpose options
  const purposeOptions = [
    { id: 'business', name: 'Business' },
    { id: 'tourism', name: 'Tourism' },
    { id: 'education', name: 'Education' },
    { id: 'medical', name: 'Medical' },
    { id: 'conference', name: 'Conference' },
    { id: 'other', name: 'Other' },
  ];

  // Fetch underwriters once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setUnderwritersLoading(true);
      setUnderwritersError(null);
      try {
        const providers = await api.getUnderwriters();
        if (cancelled) return;
        const normalized = Array.isArray(providers) ? providers : (providers?.underwriters || []);
        const mapped = normalized.map((p, idx) => ({
          id: p.code || p.underwriter_code || p.id || `uw_${idx}`,
            name: p.name || p.company || p.company_name || p.underwriter_name || `Underwriter ${idx + 1}`,
        }));
        setUnderwriters(mapped);
      } catch (e) {
        if (!cancelled) setUnderwritersError(e.message || 'Failed to load underwriters');
      } finally {
        if (!cancelled) setUnderwritersLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const toggleUnderwriter = (id) => {
    setPreferredUnderwriters(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const validationErrors = () => {
    const errs = [];
    if (!clientName.trim()) errs.push('Client Name required');
    if (!travelersAge.trim()) errs.push('Traveler Age required');
    if (travelersAge && (isNaN(Number(travelersAge)) || Number(travelersAge) <= 0)) errs.push('Enter valid age');
    if (!destination.trim()) errs.push('Destination required');
    if (!purposeOfTravel) errs.push('Purpose of Travel required');
    if (!departureDate.trim()) errs.push('Departure Date required');
    if (!returnDate.trim()) errs.push('Return Date required');
    if (preferredUnderwriters.length === 0) errs.push('Select at least one underwriter');
    return errs;
  };
  const canSubmit = validationErrors().length === 0;

  const handleSubmit = async () => {
    const errs = validationErrors();
    if (errs.length) {
      Alert.alert('Missing / Invalid', errs.join('\n'));
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const formData = {
        client_name: clientName,
        travelers_age: Number(travelersAge),
        destination,
        purpose_of_travel: purposeOfTravel,
        departure_date: departureDate,
        return_date: returnDate,
        preferredUnderwriters,
      };
      console.log('[Travel] Submitting manual quote', formData);
      const res = await api.submitManualQuote('TRAVEL', formData);
      if (res?.success) {
        Alert.alert('Quote Requested', 'Your Travel insurance quote request has been submitted. Our team will provide pricing shortly.', [
          { text: 'OK' }
        ]);
        // Reset minimal form
        setClientName('');
        setTravelersAge('');
        setDestination('');
        setPurposeOfTravel(null);
        setDepartureDate('');
        setReturnDate('');
        setPreferredUnderwriters([]);
      } else {
        Alert.alert('Error', res?.message || 'Submission failed');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="light" />
      
      {/* Red Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Heading4 style={styles.headerTitle}>Travel Insurance</Heading4>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

  {/* Client Name */}
        <View style={styles.fieldBlock}>
          <Subtitle2 style={styles.label}>Client Name</Subtitle2>
          <TextInput
            value={clientName}
            onChangeText={setClientName}
            placeholder="Enter client name"
            style={styles.input}
            placeholderTextColor={UI.textSecondary}
          />
        </View>

  {/* Traveler's Age */}
        <View style={styles.fieldBlock}>
          <Subtitle2 style={styles.label}>Traveler's Age</Subtitle2>
          <TextInput
            value={travelersAge}
            onChangeText={setTravelersAge}
            placeholder="Enter age"
            keyboardType="number-pad"
            style={styles.input}
            placeholderTextColor={UI.textSecondary}
          />
        </View>

  {/* Destination */}
        <View style={styles.fieldBlock}>
          <Subtitle2 style={styles.label}>Destination</Subtitle2>
          <TextInput
            value={destination}
            onChangeText={setDestination}
            placeholder="Enter destination country/city"
            style={styles.input}
            placeholderTextColor={UI.textSecondary}
          />
        </View>

  {/* Purpose of Travel */}
        <View style={styles.fieldBlock}>
          <Subtitle2 style={styles.label}>Purpose of Travel</Subtitle2>
          <View style={styles.optionsWrap}>
            {purposeOptions.map(opt => (
              <TouchableOpacity
                key={opt.id}
                onPress={() => setPurposeOfTravel(opt.id)}
                style={[styles.optionChip, purposeOfTravel === opt.id && styles.optionChipActive]}
              >
                <Body1 style={[styles.optionChipText, purposeOfTravel === opt.id && styles.optionChipTextActive]}>{opt.name}</Body1>
              </TouchableOpacity>
            ))}
          </View>
        </View>

  {/* Departure Date */}
        <View style={styles.fieldBlock}>
          <Subtitle2 style={styles.label}>Departure Date</Subtitle2>
          <TextInput
            value={departureDate}
            onChangeText={setDepartureDate}
            placeholder="YYYY-MM-DD"
            style={styles.input}
            placeholderTextColor={UI.textSecondary}
          />
        </View>

  {/* Return Date */}
        <View style={styles.fieldBlock}>
          <Subtitle2 style={styles.label}>Return Date</Subtitle2>
          <TextInput
            value={returnDate}
            onChangeText={setReturnDate}
            placeholder="YYYY-MM-DD"
            style={styles.input}
            placeholderTextColor={UI.textSecondary}
          />
        </View>

  {/* Preferred Underwriters */}
        <View style={styles.fieldBlock}>
          <Subtitle2 style={styles.label}>Preferred Underwriters</Subtitle2>
          {underwritersLoading && <Body2 style={styles.loadingText}>Loading underwriters...</Body2>}
          {underwritersError && !underwritersLoading && <Body2 style={styles.errorText}>{underwritersError}</Body2>}
          {!underwritersLoading && !underwritersError && (
            <View style={styles.underwriterChips}>
              {underwriters.map(u => (
                <TouchableOpacity
                  key={u.id}
                  onPress={() => toggleUnderwriter(u.id)}
                  style={[styles.uwChip, preferredUnderwriters.includes(u.id) && styles.uwChipActive]}
                >
                  <Body2 style={[styles.uwChipText, preferredUnderwriters.includes(u.id) && styles.uwChipTextActive]}>{u.name}</Body2>
                </TouchableOpacity>
              ))}
              {underwriters.length === 0 && <Body2 style={styles.loadingText}>No underwriters available</Body2>}
            </View>
          )}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          disabled={!canSubmit || submitting}
          onPress={handleSubmit}
          style={[styles.submitBtn, (!canSubmit || submitting) && styles.submitBtnDisabled]}
        >
          <ButtonText style={styles.submitText}>{submitting ? 'Submitting...' : 'Request Quote'}</ButtonText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BRAND.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  scroll: { padding: SPACING.lg, paddingBottom: 140 },
  fieldBlock: { marginBottom: SPACING.xxl },
  label: { marginBottom: SPACING.sm },
  input: {
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: UI.backgroundGray,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.input,
    color: UI.textPrimary,
  },
  optionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  optionChip: {
    backgroundColor: UI.backgroundLight,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: UI.border,
  },
  optionChipActive: { backgroundColor: BRAND.primary, borderColor: BRAND.primary },
  optionChipText: { color: UI.textSecondary },
  optionChipTextActive: { color: '#fff', fontWeight: '600' },
  underwriterChips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  uwChip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    backgroundColor: UI.backgroundLight,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  uwChipActive: { backgroundColor: BRAND.primary },
  uwChipText: { color: UI.textSecondary },
  uwChipTextActive: { color: '#fff', fontWeight: '600' },
  loadingText: { color: UI.textSecondary },
  errorText: { color: SEMANTIC.error },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: SPACING.lg,
    backgroundColor: UI.surface,
    borderTopWidth: 1,
    borderColor: UI.border,
  },
  submitBtn: {
    backgroundColor: BRAND.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontWeight: '600' },
});
