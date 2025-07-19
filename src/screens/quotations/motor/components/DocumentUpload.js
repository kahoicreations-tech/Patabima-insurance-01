/**
 * Document Upload Component
 * 
 * Handles document upload for motor insurance
 * Supports multiple document types with preview and validation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  FlatList
} from 'react-native';
import { Colors, Spacing, Typography } from '../../../../constants';

const DocumentUpload = ({ 
  documents = [], 
  updateDocuments, 
  errors 
}) => {
  const [showDocumentTypeModal, setShowDocumentTypeModal] = useState(false);

  const requiredDocumentTypes = [
    {
      id: 'kra_pin',
      name: 'KRA PIN Certificate',
      description: 'Kenya Revenue Authority PIN certificate',
      required: true,
      maxSize: '5MB',
      formats: ['PDF', 'JPG', 'PNG']
    },
    {
      id: 'national_id',
      name: 'National ID Copy',
      description: 'Copy of national identification card',
      required: true,
      maxSize: '5MB',
      formats: ['PDF', 'JPG', 'PNG']
    },
    {
      id: 'logbook',
      name: 'Logbook/Ownership Proof',
      description: 'Vehicle logbook or ownership certificate',
      required: true,
      maxSize: '10MB',
      formats: ['PDF', 'JPG', 'PNG']
    }
  ];

  const optionalDocumentTypes = [
    {
      id: 'driving_license',
      name: 'Driving License',
      description: 'Valid driving license',
      required: false,
      maxSize: '5MB',
      formats: ['PDF', 'JPG', 'PNG']
    },
    {
      id: 'previous_insurance',
      name: 'Previous Insurance Certificate',
      description: 'Previous insurance certificate (if any)',
      required: false,
      maxSize: '10MB',
      formats: ['PDF', 'JPG', 'PNG']
    },
    {
      id: 'inspection_report',
      name: 'Vehicle Inspection Report',
      description: 'Vehicle inspection report (for older vehicles)',
      required: false,
      maxSize: '10MB',
      formats: ['PDF', 'JPG', 'PNG']
    },
    {
      id: 'valuation_report',
      name: 'Vehicle Valuation Report',
      description: 'Professional vehicle valuation (for high-value vehicles)',
      required: false,
      maxSize: '10MB',
      formats: ['PDF', 'JPG', 'PNG']
    },
    {
      id: 'police_report',
      name: 'Police Abstract/Report',
      description: 'Police abstract or incident report (if applicable)',
      required: false,
      maxSize: '10MB',
      formats: ['PDF', 'JPG', 'PNG']
    }
  ];

  const allDocumentTypes = [...requiredDocumentTypes, ...optionalDocumentTypes];

  const simulateDocumentUpload = (docType) => {
    // Simulate file upload process
    const newDoc = {
      id: Date.now().toString(),
      type: docType.id,
      name: docType.name,
      fileName: `${docType.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.pdf`,
      size: `${(Math.random() * 4 + 1).toFixed(1)} MB`,
      uploadDate: new Date().toISOString(),
      status: 'uploaded',
      required: docType.required
    };

    const updatedDocuments = [...documents, newDoc];
    updateDocuments(updatedDocuments);
    setShowDocumentTypeModal(false);

    Alert.alert(
      'Document Uploaded',
      `${docType.name} has been uploaded successfully.`,
      [{ text: 'OK' }]
    );
  };

  const removeDocument = (docId) => {
    Alert.alert(
      'Remove Document',
      'Are you sure you want to remove this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedDocuments = documents.filter(doc => doc.id !== docId);
            updateDocuments(updatedDocuments);
          }
        }
      ]
    );
  };

  const getDocumentIcon = (docType) => {
    const icons = {
      kra_pin: '📄',
      national_id: '🆔',
      logbook: '📋',
      driving_license: '🪪',
      previous_insurance: '📜',
      inspection_report: '🔍',
      valuation_report: '💰',
      police_report: '🚔'
    };
    return icons[docType] || '📄';
  };

  const getUploadedDocumentByType = (typeId) => {
    return documents.find(doc => doc.type === typeId);
  };

  const getRequiredDocumentsStatus = () => {
    const uploaded = requiredDocumentTypes.filter(type => 
      getUploadedDocumentByType(type.id)
    ).length;
    const total = requiredDocumentTypes.length;
    return { uploaded, total, isComplete: uploaded === total };
  };

  const getDocumentStatusColor = (isUploaded, isRequired) => {
    if (isUploaded) return Colors.success;
    if (isRequired) return Colors.error;
    return Colors.textSecondary;
  };

  const requiredStatus = getRequiredDocumentsStatus();

  const renderDocumentTypeModal = () => (
    <Modal
      visible={showDocumentTypeModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowDocumentTypeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Document Type</Text>
            <TouchableOpacity 
              onPress={() => setShowDocumentTypeModal(false)} 
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalSectionTitle}>Required Documents</Text>
            {requiredDocumentTypes.map((docType) => {
              const isUploaded = getUploadedDocumentByType(docType.id);
              return (
                <TouchableOpacity
                  key={docType.id}
                  style={[
                    styles.modalOption,
                    isUploaded && styles.modalOptionDisabled
                  ]}
                  onPress={() => !isUploaded && simulateDocumentUpload(docType)}
                  disabled={!!isUploaded}
                >
                  <View style={styles.modalOptionContent}>
                    <View style={styles.modalOptionHeader}>
                      <Text style={styles.modalOptionIcon}>
                        {getDocumentIcon(docType.id)}
                      </Text>
                      <View style={styles.modalOptionInfo}>
                        <Text style={[
                          styles.modalOptionText,
                          isUploaded && styles.modalOptionTextDisabled
                        ]}>
                          {docType.name}
                          {isUploaded && ' ✓'}
                        </Text>
                        <Text style={styles.modalOptionDescription}>
                          {docType.description}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.modalOptionDetails}>
                      Max: {docType.maxSize} • Formats: {docType.formats.join(', ')}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            <Text style={styles.modalSectionTitle}>Optional Documents</Text>
            {optionalDocumentTypes.map((docType) => {
              const isUploaded = getUploadedDocumentByType(docType.id);
              return (
                <TouchableOpacity
                  key={docType.id}
                  style={[
                    styles.modalOption,
                    isUploaded && styles.modalOptionDisabled
                  ]}
                  onPress={() => !isUploaded && simulateDocumentUpload(docType)}
                  disabled={!!isUploaded}
                >
                  <View style={styles.modalOptionContent}>
                    <View style={styles.modalOptionHeader}>
                      <Text style={styles.modalOptionIcon}>
                        {getDocumentIcon(docType.id)}
                      </Text>
                      <View style={styles.modalOptionInfo}>
                        <Text style={[
                          styles.modalOptionText,
                          isUploaded && styles.modalOptionTextDisabled
                        ]}>
                          {docType.name}
                          {isUploaded && ' ✓'}
                        </Text>
                        <Text style={styles.modalOptionDescription}>
                          {docType.description}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.modalOptionDetails}>
                      Max: {docType.maxSize} • Formats: {docType.formats.join(', ')}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supporting Documents</Text>
      <Text style={styles.subtitle}>
        Upload required documents for your motor insurance application
      </Text>

      {/* Upload Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>Upload Progress</Text>
          <Text style={[
            styles.statusProgress,
            requiredStatus.isComplete ? { color: Colors.success } : { color: Colors.error }
          ]}>
            {requiredStatus.uploaded}/{requiredStatus.total} Required Documents
          </Text>
        </View>
        
        <View style={styles.progressBar}>
          <View style={[
            styles.progressFill,
            { 
              width: `${(requiredStatus.uploaded / requiredStatus.total) * 100}%`,
              backgroundColor: requiredStatus.isComplete ? Colors.success : Colors.primary
            }
          ]} />
        </View>
        
        {!requiredStatus.isComplete && (
          <Text style={styles.statusWarning}>
            Please upload all required documents to proceed
          </Text>
        )}
      </View>

      {/* Add Document Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowDocumentTypeModal(true)}
      >
        <Text style={styles.addButtonIcon}>+</Text>
        <Text style={styles.addButtonText}>Add Document</Text>
      </TouchableOpacity>

      {/* Required Documents Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Required Documents</Text>
        {requiredDocumentTypes.map((docType) => {
          const uploadedDoc = getUploadedDocumentByType(docType.id);
          const isUploaded = !!uploadedDoc;
          
          return (
            <View key={docType.id} style={styles.documentItem}>
              <View style={styles.documentHeader}>
                <Text style={styles.documentIcon}>
                  {getDocumentIcon(docType.id)}
                </Text>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName}>{docType.name}</Text>
                  <Text style={styles.documentDescription}>{docType.description}</Text>
                </View>
                <View style={[
                  styles.documentStatus,
                  { backgroundColor: getDocumentStatusColor(isUploaded, docType.required) }
                ]}>
                  <Text style={styles.documentStatusText}>
                    {isUploaded ? '✓' : '!'}
                  </Text>
                </View>
              </View>
              
              {isUploaded && (
                <View style={styles.uploadedDocInfo}>
                  <View style={styles.uploadedDocDetails}>
                    <Text style={styles.uploadedDocName}>{uploadedDoc.fileName}</Text>
                    <Text style={styles.uploadedDocMeta}>
                      {uploadedDoc.size} • Uploaded {new Date(uploadedDoc.uploadDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeDocument(uploadedDoc.id)}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Optional Documents Section */}
      {documents.some(doc => !doc.required) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Optional Documents</Text>
          {optionalDocumentTypes.map((docType) => {
            const uploadedDoc = getUploadedDocumentByType(docType.id);
            const isUploaded = !!uploadedDoc;
            
            if (!isUploaded) return null;
            
            return (
              <View key={docType.id} style={styles.documentItem}>
                <View style={styles.documentHeader}>
                  <Text style={styles.documentIcon}>
                    {getDocumentIcon(docType.id)}
                  </Text>
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentName}>{docType.name}</Text>
                    <Text style={styles.documentDescription}>{docType.description}</Text>
                  </View>
                  <View style={[
                    styles.documentStatus,
                    { backgroundColor: Colors.success }
                  ]}>
                    <Text style={styles.documentStatusText}>✓</Text>
                  </View>
                </View>
                
                <View style={styles.uploadedDocInfo}>
                  <View style={styles.uploadedDocDetails}>
                    <Text style={styles.uploadedDocName}>{uploadedDoc.fileName}</Text>
                    <Text style={styles.uploadedDocMeta}>
                      {uploadedDoc.size} • Uploaded {new Date(uploadedDoc.uploadDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeDocument(uploadedDoc.id)}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Document Guidelines */}
      <View style={styles.guidelinesCard}>
        <Text style={styles.guidelinesTitle}>Document Guidelines</Text>
        <View style={styles.guideline}>
          <Text style={styles.guidelineIcon}>📱</Text>
          <Text style={styles.guidelineText}>
            Take clear photos or scan documents in good lighting
          </Text>
        </View>
        <View style={styles.guideline}>
          <Text style={styles.guidelineIcon}>📄</Text>
          <Text style={styles.guidelineText}>
            Ensure all text is readable and documents are not cropped
          </Text>
        </View>
        <View style={styles.guideline}>
          <Text style={styles.guidelineIcon}>💾</Text>
          <Text style={styles.guidelineText}>
            File size should not exceed the specified limits
          </Text>
        </View>
        <View style={styles.guideline}>
          <Text style={styles.guidelineIcon}>✅</Text>
          <Text style={styles.guidelineText}>
            Upload original documents only (no photocopies of photocopies)
          </Text>
        </View>
      </View>

      {errors.documents && (
        <Text style={styles.errorText}>{errors.documents}</Text>
      )}

      {renderDocumentTypeModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  statusCard: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statusTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  statusProgress: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  statusWarning: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.error,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  addButtonIcon: {
    fontSize: Typography.fontSize.xl,
    color: Colors.white,
    marginRight: Spacing.sm,
    fontFamily: Typography.fontFamily.bold,
  },
  addButtonText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.white,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  documentItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentIcon: {
    fontSize: Typography.fontSize.xl,
    marginRight: Spacing.md,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  documentDescription: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  documentStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentStatusText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
  },
  uploadedDocInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  uploadedDocDetails: {
    flex: 1,
  },
  uploadedDocName: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  uploadedDocMeta: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  removeButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  removeButtonText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.error,
  },
  guidelinesCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guidelinesTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  guideline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  guidelineIcon: {
    fontSize: Typography.fontSize.md,
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  guidelineText: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.error,
    marginTop: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  modalCloseButton: {
    padding: Spacing.sm,
  },
  modalCloseText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textSecondary,
  },
  modalSectionTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.lightGray,
  },
  modalOption: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  modalOptionDisabled: {
    opacity: 0.5,
  },
  modalOptionContent: {
    flex: 1,
  },
  modalOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  modalOptionIcon: {
    fontSize: Typography.fontSize.xl,
    marginRight: Spacing.md,
  },
  modalOptionInfo: {
    flex: 1,
  },
  modalOptionText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  modalOptionTextDisabled: {
    color: Colors.textSecondary,
  },
  modalOptionDescription: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  modalOptionDetails: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
});

export default DocumentUpload;
