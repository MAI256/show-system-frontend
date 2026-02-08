export const useDirectus = () => {
  const DIRECTUS_URL = "https://admin.showsystem.productions";

  const submitRequest = async (data: {
    company: string;
    phone: string;
    telegram: string;
  }) => {
    try {
      return await $fetch(`${DIRECTUS_URL}/items/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      });
    } catch (error: any) {
      const statusCode = error?.response?.status || error?.statusCode || 500;

      throw createError({
        statusCode,
        message:
          error?.data?.errors?.[0]?.message ||
          error.message ||
          (statusCode === 404
            ? "Сервис недоступен"
            : "Не удалось отправить заявку"),
        fatal: false,
      });
    }
  };

  const getProject = async (slug: string) => {
    let retries = 0;
    const maxRetries = 2;
    const retryDelay = 1000; // 1 second, will be multiplied by retry count

    const fetchProject = async (): Promise<any> => {
      try {
        const controller = new AbortController();
        const timeoutHandle = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(
          `https://admin.showsystem.productions/items/projects?filter[slug][_eq]=${slug}&filter[status][_eq]=published&fields=*,images.directus_files_id.*`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          },
        );

        clearTimeout(timeoutHandle);

        if (!response.ok) {
          const statusCode = response.status;
          const errorData = await response.json().catch(() => ({}));

          throw createError({
            statusCode,
            message:
              errorData.errors?.[0]?.message ||
              (statusCode === 404 ? "Проект не найден" : "Ошибка загрузки проекта"),
            data: { slug },
          });
        }

        const data = await response.json();
        const project = data.data?.[0];

        if (!project) {
          throw createError({
            statusCode: 404,
            message: `Проект с slug "${slug}" не существует`,
            data: { slug },
          });
        }

        // Filter images to only include actual image files
        if (project.images && Array.isArray(project.images)) {
          project.images = project.images.filter((item: any) => {
            const file = item.directus_files_id || item;
            const type = file?.type || "";
            return type.startsWith("image/");
          });
        }

        // Get previous and next projects
        const currentSort = project.sort;

        const [prevResponse, nextResponse] = await Promise.all([
          // Previous: sort < current, DESC order, limit 1
          fetch(
            `https://admin.showsystem.productions/items/projects?filter[sort][_lt]=${currentSort}&filter[status][_eq]=published&sort=-sort&limit=1&fields=id,title,slug,main_photo`,
            { method: "GET", headers: { "Content-Type": "application/json" } },
          ),
          // Next: sort > current, ASC order, limit 1
          fetch(
            `https://admin.showsystem.productions/items/projects?filter[sort][_gt]=${currentSort}&filter[status][_eq]=published&sort=sort&limit=1&fields=id,title,slug,main_photo`,
            { method: "GET", headers: { "Content-Type": "application/json" } },
          ),
        ]);

        let prevProject = null;
        let nextProject = null;

        if (prevResponse.ok) {
          const prevData = await prevResponse.json();
          prevProject = prevData.data?.[0];
        }

        if (nextResponse.ok) {
          const nextData = await nextResponse.json();
          nextProject = nextData.data?.[0];
        }

        // If previous not found, get max sort
        if (!prevProject) {
          const maxSortResponse = await fetch(
            `https://admin.showsystem.productions/items/projects?filter[status][_eq]=published&sort=-sort&limit=1&fields=id,title,slug,main_photo`,
            { method: "GET", headers: { "Content-Type": "application/json" } },
          );
          if (maxSortResponse.ok) {
            const maxSortData = await maxSortResponse.json();
            prevProject = maxSortData.data?.[0] || null;
          }
        }

        // If next not found, get sort = 1 (min sort)
        if (!nextProject) {
          const minSortResponse = await fetch(
            `https://admin.showsystem.productions/items/projects?filter[status][_eq]=published&sort=sort&limit=1&fields=id,title,slug,main_photo`,
            { method: "GET", headers: { "Content-Type": "application/json" } },
          );
          if (minSortResponse.ok) {
            const minSortData = await minSortResponse.json();
            nextProject = minSortData.data?.[0] || null;
          }
        }

        const result = {
          ...project,
          prevProject,
          nextProject,
        };
        return result;
      } catch (error: any) {
        // If it's a createError, re-throw it
        if (error.statusCode) throw error;

        // Network error - retry
        if (retries < maxRetries) {
          retries++;
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * retries),
          );
          return fetchProject();
        }

        // Max retries exceeded - throw service unavailable error
        throw createError({
          statusCode: 503,
          message:
            "Не удалось подключиться к серверу. Проверьте интернет-соединение.",
          data: { originalError: error.message, slug },
        });
      }
    };

    return fetchProject();
  };

  const getProjects = async () => {
    let retries = 0;
    const maxRetries = 2;
    const retryDelay = 1000; // 1 second, will be multiplied by retry count

    const fetchProjects = async (): Promise<any[]> => {
      try {
        const controller = new AbortController();
        const timeoutHandle = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(
          `https://admin.showsystem.productions/items/projects?filter[status][_eq]=published&sort=sort&fields=id,title,slug,main_color,main_photo`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          },
        );

        clearTimeout(timeoutHandle);

        if (!response.ok) {
          const statusCode = response.status;
          const errorData = await response.json().catch(() => ({}));

          throw createError({
            statusCode,
            message:
              errorData.errors?.[0]?.message ||
              (statusCode === 404
                ? "Проекты не найдены"
                : "Ошибка загрузки проектов"),
          });
        }

        const data = await response.json();
        return data.data || [];
      } catch (error: any) {
        // If it's a createError, re-throw it
        if (error.statusCode) throw error;

        // Network error - retry
        if (retries < maxRetries) {
          retries++;
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * retries),
          );
          return fetchProjects();
        }

        // Max retries exceeded - throw service unavailable error
        throw createError({
          statusCode: 503,
          message:
            "Не удалось подключиться к серверу. Проверьте интернет-соединение.",
          data: { originalError: error.message },
        });
      }
    };

    return fetchProjects();
  };

  return {
    submitRequest,
    getProject,
    getProjects,
  };
};
