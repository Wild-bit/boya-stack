import { createBrowserRouter, redirect } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout.tsx";
import { LoginPage } from "../modules/login/pages/LoginPage";
import { ErrorPage } from "../modules/error/pages/ErrorPage";
import { TeamDetailPage } from "@/modules/teams/pages/TeamDetailPage";
import { TeamSwitcher } from "../components/TeamSwitcher";
import { getProjectBySlugApi, getTeamBySlugApi, getTeamListApi } from "@/api/organization";
import { CURRENT_TEAM_SLUG_LOCAL_STORAGE_KEY } from "@/contants";
import { useAppStore } from "@/stores";
import Lottie from "lottie-react";
import loadingAnimation from "@/assets/loading.json";
import { SettingsPage } from "@/modules/teams/pages/SettingsPage";
import { TeamDetailLayout } from "@/modules/teams/components/layouts/TeamDetailLayout";
import { ProjectBreadcrumb } from "@/modules/projects/components/ProjectBreadcrumb";
import { AccountSettingPage } from "@/modules/account-setting/pages/AccountSettingPage";
import { InvitePage } from "@/modules/invite/pages/InvitePage.tsx";
import { HomePage } from "@/modules/home/pages/HomePage";
import { KeysPage } from "@/modules/projects/pages/keysPage";
import { ProjectSettingPage } from "@/modules/projects/pages/settingPage";
import { ExportPage } from "@/modules/projects/pages/exportPage";
import { ImportPage } from "@/modules/projects/pages/importPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    handle: {
      breadcrumb: () => (
        <img src="/logo.svg" alt="logo" className="w-[30px] h-[30px]" />
      ),
    },
    errorElement: <ErrorPage />,
    hydrateFallbackElement: (
      <div className="flex items-center justify-center h-screen">
        <Lottie animationData={loadingAnimation} loop className="w-10" />
      </div>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
        loader: async () => {
          const { setTeams } = useAppStore.getState();
          const currentTeamSlug = localStorage.getItem(CURRENT_TEAM_SLUG_LOCAL_STORAGE_KEY);
          if (currentTeamSlug) {
            return redirect(`/${currentTeamSlug}`);
          }
          const teamList = await getTeamListApi();
          if (teamList.data.items.length > 0) {
            setTeams(teamList.data.items);
            const slug = teamList.data.items[0]?.slug;
            localStorage.setItem(CURRENT_TEAM_SLUG_LOCAL_STORAGE_KEY, slug!);
            return redirect(`/${slug}`);
          }
          return null;
        },
      },
      {
        path: ":teamSlug",
        id: "team-detail",
        element: <TeamDetailLayout />,
        handle: {
          breadcrumb: () => <TeamSwitcher />,
        },
        loader: async ({ params }) => {
          try {
            const res = await getTeamBySlugApi(params.teamSlug!);
            useAppStore.getState().setCurrentTeam(res.data);
            // 获取当前用户在团队中的角色
            useAppStore.getState().fetchMyRole(res.data.id);
            return {
              currentTeam: res.data,
            };
          } catch {
            localStorage.removeItem(CURRENT_TEAM_SLUG_LOCAL_STORAGE_KEY);
            return redirect('/');
          }
        },
        children: [
          {
            index: true,
            element: <TeamDetailPage />,
          },
          {
            path: ":projectSlug",
            id: "project-detail",
            element: <KeysPage />,
            loader: async ({ params }) => {
              const project = await getProjectBySlugApi(params.teamSlug!, params.projectSlug!);
              useAppStore.getState().setCurrentProject(project.data);
              return {
                project: project.data,
              };
            },
            handle: {
              breadcrumb: () => <ProjectBreadcrumb />
            },
          },
          {
            path: ":projectSlug/import",
            element: <ImportPage />,
            handle: {
              breadcrumb: () => <ProjectBreadcrumb />
            },
            loader: async ({ params }) => {
              const project = await getProjectBySlugApi(params.teamSlug!, params.projectSlug!);
              useAppStore.getState().setCurrentProject(project.data);
              return { project: project.data };
            },
          },
          {
            path: ":projectSlug/export",
            element: <ExportPage />,
            handle: {
              breadcrumb: () => <ProjectBreadcrumb />
            },
            loader: async ({ params }) => {
              const project = await getProjectBySlugApi(params.teamSlug!, params.projectSlug!);
              useAppStore.getState().setCurrentProject(project.data);
              return { project: project.data };
            },
          },
          {
            path: ":projectSlug/settings",
            element: <ProjectSettingPage />,
            loader: async ({ params }) => {
              const project = await getProjectBySlugApi(params.teamSlug!, params.projectSlug!);
              useAppStore.getState().setCurrentProject(project.data);
              return { project: project.data };
            },
            handle: {
              breadcrumb: () => <ProjectBreadcrumb />
            },
          },

          {
            path: "settings",
            element: <SettingsPage />,
          },
        ],
      },
      {
        path: '/settings',
        handle: {
          breadcrumb: () => <TeamSwitcher />,
        },
        element: <AccountSettingPage />,
      }
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: '/invite',
    element: <InvitePage />
  }
]);

export default router;