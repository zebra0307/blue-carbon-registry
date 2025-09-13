'use client';

import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onViewDetails: (project: Project) => void;
}

export default function ProjectCard({ project, onViewDetails }: ProjectCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Project #{project.projectId}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Owner: {project.owner.toBase58().slice(0, 8)}...
            </p>
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Credits Issued:</span>
            <span className="font-medium text-gray-900">
              {project.creditsIssued.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={() => onViewDetails(project)}
            className="flex-1 bg-ocean-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-ocean-blue-700 transition-colors"
          >
            View Details
          </button>
          <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
            Manage Credits
          </button>
        </div>
      </div>
    </div>
  );
}
