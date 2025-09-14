import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Surface,
  Chip,
  FAB,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDatabase } from '../providers/DatabaseProvider';
import { Project, FieldMeasurement } from '../types';

const ProjectsScreen = ({ navigation }: any) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { getProjects, getMeasurements } = useDatabase();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const projectData = await getProjects();
      setProjects(projectData);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const getEcosystemIcon = (type: string) => {
    switch (type) {
      case 'mangrove':
        return 'park';
      case 'seagrass':
        return 'grass';
      case 'saltmarsh':
        return 'water';
      case 'kelp':
        return 'waves';
      default:
        return 'nature';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return '#f59e0b';
      case 'active':
        return '#10b981';
      case 'monitoring':
        return '#3b82f6';
      case 'completed':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card style={styles.projectCard}>
      <Card.Content>
        <View style={styles.projectHeader}>
          <View style={styles.projectInfo}>
            <Title style={styles.projectTitle}>{project.name}</Title>
            <Paragraph style={styles.projectDescription} numberOfLines={2}>
              {project.description}
            </Paragraph>
          </View>
          <View style={styles.projectIcon}>
            <Icon 
              name={getEcosystemIcon(project.ecosystemType)} 
              size={32} 
              color="#2563eb" 
            />
          </View>
        </View>

        <View style={styles.projectMeta}>
          <Chip 
            mode="outlined" 
            style={[styles.statusChip, { borderColor: getStatusColor(project.status) }]}
            textStyle={{ color: getStatusColor(project.status) }}
          >
            {project.status.toUpperCase()}
          </Chip>
          <Chip mode="outlined" style={styles.typeChip}>
            {project.ecosystemType.charAt(0).toUpperCase() + project.ecosystemType.slice(1)}
          </Chip>
        </View>

        <View style={styles.projectStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{project.measurements.length}</Text>
            <Text style={styles.statLabel}>Measurements</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{project.totalArea.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Hectares</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{project.estimatedCarbon.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Tonnes CO₂</Text>
          </View>
        </View>

        <View style={styles.projectLocation}>
          <Icon name="location-on" size={16} color="#6b7280" />
          <Text style={styles.locationText}>
            {project.location.latitude.toFixed(6)}, {project.location.longitude.toFixed(6)}
          </Text>
        </View>

        <View style={styles.projectActions}>
          <Button
            mode="outlined"
            onPress={() => setSelectedProject(project)}
            style={styles.actionButton}
          >
            View Details
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Collect', { projectId: project.id })}
            style={styles.actionButton}
          >
            Collect Data
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const ProjectDetails = ({ project }: { project: Project }) => (
    <Card style={styles.detailsCard}>
      <Card.Content>
        <View style={styles.detailsHeader}>
          <Title>{project.name}</Title>
          <TouchableOpacity onPress={() => setSelectedProject(null)}>
            <Icon name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <Paragraph style={styles.detailsDescription}>
          {project.description}
        </Paragraph>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Project Information</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Ecosystem Type</Text>
              <Text style={styles.detailValue}>
                {project.ecosystemType.charAt(0).toUpperCase() + project.ecosystemType.slice(1)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={[styles.detailValue, { color: getStatusColor(project.status) }]}>
                {project.status.toUpperCase()}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Total Area</Text>
              <Text style={styles.detailValue}>{project.totalArea} hectares</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Estimated Carbon</Text>
              <Text style={styles.detailValue}>{project.estimatedCarbon} tonnes CO₂</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Recent Measurements</Text>
          {project.measurements.length === 0 ? (
            <Text style={styles.emptyText}>No measurements yet</Text>
          ) : (
            project.measurements.slice(0, 3).map((measurement) => (
              <Surface key={measurement.id} style={styles.measurementItem}>
                <View style={styles.measurementHeader}>
                  <Text style={styles.measurementType}>
                    {measurement.measurementType.toUpperCase()}
                  </Text>
                  <Text style={styles.measurementDate}>
                    {new Date(measurement.timestamp).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.measurementNotes} numberOfLines={1}>
                  {measurement.notes || 'No notes'}
                </Text>
                <View style={styles.measurementFooter}>
                  <Text style={styles.measurementLocation}>
                    {measurement.location.latitude.toFixed(4)}, {measurement.location.longitude.toFixed(4)}
                  </Text>
                  <Icon 
                    name={measurement.synced ? 'cloud-done' : 'cloud-upload'} 
                    size={14} 
                    color={measurement.synced ? '#10b981' : '#f59e0b'} 
                  />
                </View>
              </Surface>
            ))
          )}
        </View>

        <Button
          mode="contained"
          onPress={() => {
            setSelectedProject(null);
            navigation.navigate('Collect', { projectId: project.id });
          }}
          style={styles.collectButton}
        >
          Collect Data for This Project
        </Button>
      </Card.Content>
    </Card>
  );

  if (selectedProject) {
    return (
      <ScrollView style={styles.container}>
        <ProjectDetails project={selectedProject} />
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Title style={styles.headerTitle}>Projects</Title>
          <Paragraph style={styles.headerSubtitle}>
            Blue carbon ecosystem projects
          </Paragraph>
        </View>

        {projects.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <View style={styles.emptyContent}>
                <Icon name="folder-open" size={64} color="#d1d5db" />
                <Text style={styles.emptyTitle}>No Projects Yet</Text>
                <Text style={styles.emptyDescription}>
                  Projects will appear here once they are created in the web application.
                </Text>
              </View>
            </Card.Content>
          </Card>
        ) : (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => navigation.navigate('Collect')}
        label="Collect Data"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  projectCard: {
    margin: 16,
    marginBottom: 8,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  projectIcon: {
    marginLeft: 12,
  },
  projectMeta: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statusChip: {
    marginRight: 8,
  },
  typeChip: {
    backgroundColor: '#f3f4f6',
  },
  projectStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  projectLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  projectActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  detailsCard: {
    margin: 16,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsDescription: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 24,
  },
  detailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '50%',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
    marginTop: 2,
  },
  measurementItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  measurementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  measurementType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  measurementDate: {
    fontSize: 10,
    color: '#6b7280',
  },
  measurementNotes: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 4,
  },
  measurementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  measurementLocation: {
    fontSize: 10,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  collectButton: {
    marginTop: 16,
  },
  emptyCard: {
    margin: 16,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyText: {
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2563eb',
  },
});

export default ProjectsScreen;