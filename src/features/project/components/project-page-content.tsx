"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Project, ProjectStatus } from "@/entities/project";
import { RequestStatus } from "@/entities/request";
import { AddProjectForm } from "@/features/project/components/add-project-form";
import { useRequests } from "@/features/request/queries/use-requests";
import { useUserByIdQuery } from "@/features/user/queries/use-user-by-id-query";
import { useProjectsQuery } from "../queries/use-projects-query";
import { UpdateProjectForm } from "./update-project-form";

export function ProjectPageContent() {
  const { data: projects, isPending: isProjectsPending } = useProjectsQuery();
  const { data: requests, isPending: isRequestsPending } = useRequests();

  const expProjects = projects?.filter(
    (project) => project.status === ProjectStatus.Exp,
  );

  const externalProjects = projects?.filter(
    (project) => project.status === ProjectStatus.External,
  );

  const expTotal = requests
    ?.filter((request) => {
      if (request.status !== RequestStatus.Paid) return false;
      const project = projects?.find(
        (project) => project.id === request.projectId,
      );
      return project?.status === ProjectStatus.Exp;
    })
    .reduce((acc, request) => {
      const project = projects?.find(
        (project) => project.id === request.projectId,
      );
      return acc + (project ? project.expense : 0);
    }, 0);

  return (
    <>
      <p className="my-4">案件統計</p>
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-4">
        <StatusCard
          title="登録案件数"
          count={projects?.length || 0}
          label="件"
          skeleton={isProjectsPending}
        />
        <StatusCard
          title="EXP.案件"
          count={expProjects?.length || 0}
          label="件"
          skeleton={isProjectsPending}
        />
        <StatusCard
          title="外部案件"
          count={externalProjects?.length || 0}
          label="件"
          skeleton={isProjectsPending}
        />
        <StatusCard
          title="EXP.合計金額"
          count={expTotal || 0}
          label="円"
          skeleton={isRequestsPending}
        />
      </div>
      <div className="my-8 rounded-lg border border-blue-200 bg-blue-50 p-6 text-left text-blue-900 text-sm">
        <p className="mb-1.5">案件について</p>
        <ul className="ml-2.5 list-disc">
          <li className="mb-1">交通費申請時に選択できる案件を管理します</li>
          <li className="mb-1">案件を選択すると、金額が自動的に反映されます</li>
          <li className="mb-1">EXP.案件は、EXP.が費用を負担する案件です</li>
        </ul>
      </div>
      <div className="mb-5 flex justify-between">
        <p>登録案件一覧</p>
        <AddProjectForm />
      </div>

      <Table className="mb-6 overflow-hidden rounded-lg shadow">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-20 text-left">案件名</TableHead>
            <TableHead className="w-12.5 text-left">金額</TableHead>
            <TableHead className="w-5 text-left">ステータス</TableHead>
            <TableHead className="w-12.5 text-left">登録者</TableHead>
            <TableHead className="w-12.5 text-left">登録日</TableHead>
            <TableHead className="w-5 text-left">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white">
          {isProjectsPending ? (
            Array.from(
              { length: 5 },
              (_, index) => `skeleton-row-${index}`,
            ).map((id) => <ProjectTableSkeletonRow key={id} />)
          ) : projects?.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-6 text-center text-gray-400 text-sm"
              >
                案件がありません。
              </TableCell>
            </TableRow>
          ) : (
            projects?.map((project) => (
              <ProjectsTableRow key={project.id} project={project} />
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}

type StatusCardProps = {
  title: string;
  count: number;
  label: string;
  skeleton?: boolean;
};

function StatusCard({ title, count, label, skeleton }: StatusCardProps) {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl">
        {skeleton ? (
          <Skeleton className="h-10 w-20 rounded-md" />
        ) : (
          <>
            {count}
            {label}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ProjectsTableRow({ project }: { project: Project }) {
  const { data: user } = useUserByIdQuery(project.createdBy);

  return (
    <TableRow key={project.id}>
      <TableCell className="py-4">{project.name}</TableCell>
      <TableCell className="py-4">￥{project.expense}</TableCell>
      <TableCell className="py-4">
        <Badge
          className={
            project.status === ProjectStatus.External
              ? "bg-sky-50 p-3 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
              : "bg-purple-50 p-3 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
          }
        >
          {project.status === ProjectStatus.External ? "外部案件" : "EXP."}
        </Badge>
      </TableCell>
      <TableCell className="py-4">
        {user ? user.name : <Skeleton className="w-full py-4" />}
      </TableCell>
      <TableCell className="py-4">
        {project.createdAt.toLocaleDateString("ja-JP")}
      </TableCell>
      <TableCell className="py-4">
        <UpdateProjectForm project={project} />
      </TableCell>
    </TableRow>
  );
}

function ProjectTableSkeletonRow() {
  return (
    <TableRow>
      {Array.from({ length: 6 }, (_, index) => `skeleton-cell-${index}`).map(
        (id) => (
          <TableCell className="py-4" key={id}>
            <Skeleton className="h-6 w-full rounded-md" />
          </TableCell>
        ),
      )}
    </TableRow>
  );
}
