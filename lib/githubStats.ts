export async function fetchGithubRepos(token: string) {
    if (!token) return [];

    try {
        const response = await fetch(
            "https://api.github.com/user/repos?sort=updated&type=all&per_page=10",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28",
                },
            }
        );

        if (!response.ok) {
            const errorBody = await response.text(); 
            console.error("GitHub API error:", response.status, errorBody);
            throw new Error("GitHub API request failed");
        }

        const repos = await response.json();
        if (!Array.isArray(repos)) return [];

        const reposWithStats = await Promise.all(
            repos.map(async (repo: any) => {
                const stats = await fetchRepoCommitStats(
                    token,
                    repo.owner.login,
                    repo.name
                );

                return {
                    id: repo.id,
                    name: repo.name,
                    full_name: repo.full_name,
                    description: repo.description,
                    stars: repo.stargazers_count,
                    forks: repo.forks_count,
                    language: repo.language,
                    url: repo.html_url,
                    isPrivate: repo.private,
                    updatedAt: repo.updated_at,
                    openIssues: repo.open_issues_count,
                    commitTrend: stats.trend,
                    weeklyCommits: stats.weeklyCommits,
                    totalCommits: stats.totalCommits,
                };
            })
        );

        return reposWithStats.slice(0, 6);
    } catch (error) {
        console.error("Error fetching GitHub repos:", error);
        return [];
    }
}

async function fetchRepoCommitStats(token: string, owner: string, repo: string) {
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/stats/participation`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
            },
        });

        if (!response.ok) return { trend: 'stable', weeklyCommits: 0, totalCommits: 0 };

        const data = await response.json();
        const weeklyCommits = data.all || [];

        if (weeklyCommits.length < 2) return { trend: 'stable', weeklyCommits: 0, totalCommits: 0 };

        const currentWeek = weeklyCommits[weeklyCommits.length - 1];
        const lastWeek = weeklyCommits[weeklyCommits.length - 2];
        const totalCommits = weeklyCommits.reduce((a: number, b: number) => a + b, 0);

        let trend = 'stable';
        if (currentWeek > lastWeek) trend = 'up';
        else if (currentWeek < lastWeek) trend = 'down';

        return {
            trend,
            weeklyCommits: currentWeek,
            totalCommits
        };
    } catch (e) {
        return { trend: 'stable', weeklyCommits: 0, totalCommits: 0 };
    }
}

export async function fetchGithubContributions(token: string, username: string) {
    if (!token || !username) return null;

    const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                color
              }
            }
          }
        }
      }
    }
    `;

    try {
        const response = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, variables: { username } }),
        });

        if (!response.ok) return null;

        const data = await response.json();
        return data.data.user.contributionsCollection.contributionCalendar;
    } catch (error) {
        console.error("Error fetching GitHub contributions:", error);
        return null;
    }
}

export async function fetchRecentCommits(token: string, username: string) {
    if (!token || !username) return [];

    try {
        const response = await fetch(
            `https://api.github.com/users/${username}/events`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/vnd.github.v3+json",
                },
            }
        );

        if (!response.ok) {
            console.error("GitHub API error:", response.status);
            return [];
        }

        const events = await response.json();
        if (!Array.isArray(events)) return [];

        const commits: any[] = [];

        events.forEach((event: any) => {
            if (event.type !== "PushEvent") return;

            const repoName = event.repo?.name;
            const commitList = event.payload?.commits;

            if (!repoName || !Array.isArray(commitList)) return;

            commitList.forEach((commit: any) => {
                if (!commit?.sha) return;

                commits.push({
                    sha: commit.sha,
                    message: commit.message ?? "No commit message",
                    repo: repoName,
                    date: event.created_at,
                    url: `https://github.com/${repoName}/commit/${commit.sha}`,
                });
            });
        });

        return commits
            .sort(
                (a, b) =>
                    new Date(b.date).getTime() -
                    new Date(a.date).getTime()
            )
            .slice(0, 15);
    } catch (error) {
        console.error("Error fetching recent commits:", error);
        return [];
    }
}

export async function fetchGithubUserStats(token: string) {
    if (!token) return null;

    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
            },
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }

        const user = await response.json();
        return {
            publicRepos: user.public_repos,
            totalPrivateRepos: user.total_private_repos,
            followers: user.followers,
            following: user.following,
            login: user.login,
            avatarUrl: user.avatar_url
        };
    } catch (error) {
        console.error("Error fetching GitHub user stats:", error);
        return null;
    }
}
