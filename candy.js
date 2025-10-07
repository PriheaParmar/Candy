const form = document.getElementById('candidateForm');
        const tableBody = document.querySelector('#candidateTable tbody');

        // Sample job role mapping (expand as needed)
        const roleMapping = {
            // Frontend Developer
            "frontend developer": {
                core: ["html5", "css3", "javascript", "typescript", "dom manipulation", "responsive design"],
                frameworks: ["react", "vue.js", "angular", "svelte", "nextjs", "nuxtjs", "gatsby", "remix"],
                styling: ["sass", "scss", "less", "styled-components", "emotion", "tailwind css", "bootstrap", "material-ui", "ant design", "chakra ui"],
                tools: ["webpack", "vite", "parcel", "rollup", "babel", "eslint", "prettier", "npm", "yarn", "pnpm"],
                testing: ["jest", "cypress", "playwright", "testing-library", "vitest", "storybook"],
                state_management: ["redux", "zustand", "mobx", "recoil", "vuex", "pinia", "context api"],
                build_tools: ["webpack", "vite", "gulp", "grunt", "esbuild"],
                version_control: ["git", "github", "gitlab", "bitbucket"],
                design_tools: ["figma", "sketch", "adobe xd", "zeplin", "invision"],
                performance: ["lighthouse", "web vitals", "lazy loading", "code splitting", "tree shaking"],
                accessibility: ["wcag", "aria", "screen readers", "keyboard navigation"],
                pwa: ["service workers", "web app manifest", "offline functionality", "push notifications"]
            },

            // Backend Developer
            "backend developer": {
                languages: ["javascript", "typescript", "python", "java", "c#", "php", "go", "rust", "ruby", "kotlin", "scala"],
                frameworks: ["express.js", "nestjs", "fastify", "spring boot", "django", "flask", "fastapi", "asp.net core", "laravel", "symfony", "gin", "actix-web", "rails"],
                databases: ["postgresql", "mysql", "mongodb", "redis", "elasticsearch", "cassandra", "dynamodb", "sqlite", "oracle", "sql server"],
                orm: ["prisma", "typeorm", "sequelize", "hibernate", "entity framework", "django orm", "sqlalchemy", "eloquent"],
                api: ["rest", "graphql", "grpc", "websockets", "openapi", "swagger", "postman"],
                authentication: ["jwt", "oauth2", "saml", "passport.js", "auth0", "firebase auth", "keycloak"],
                caching: ["redis", "memcached", "varnish", "cdn", "application caching"],
                message_queues: ["rabbitmq", "apache kafka", "redis pub/sub", "amazon sqs", "google pub/sub"],
                testing: ["jest", "mocha", "chai", "pytest", "junit", "nunit", "phpunit", "rspec"],
                monitoring: ["prometheus", "grafana", "new relic", "datadog", "sentry", "elk stack"],
                security: ["https", "cors", "rate limiting", "input validation", "sql injection prevention", "xss protection"],
                microservices: ["docker", "kubernetes", "service mesh", "api gateway", "circuit breaker"]
            },

            // Full Stack Developer
            "full stack developer": {
                frontend: ["react", "vue.js", "angular", "html5", "css3", "javascript", "typescript", "tailwind css", "bootstrap"],
                backend: ["node.js", "express.js", "nestjs", "python", "django", "flask", "java", "spring boot", "c#", "asp.net core"],
                databases: ["postgresql", "mysql", "mongodb", "redis", "sqlite"],
                deployment: ["docker", "aws", "heroku", "netlify", "vercel", "digital ocean"],
                version_control: ["git", "github actions", "gitlab ci"],
                testing: ["jest", "cypress", "pytest", "junit"],
                api: ["rest", "graphql", "websockets"],
                authentication: ["jwt", "oauth2", "passport.js"],
                state_management: ["redux", "context api", "zustand"],
                build_tools: ["webpack", "vite", "docker compose"],
                cloud_services: ["aws lambda", "s3", "cloudfront", "rds", "mongodb atlas"],
                monitoring: ["sentry", "google analytics", "hotjar"]
            },

            // Data Scientist
            "data scientist": {
                languages: ["python", "r", "sql", "scala", "julia", "matlab"],
                python_libraries: ["pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "keras", "matplotlib", "seaborn", "plotly", "scipy", "statsmodels"],
                r_packages: ["dplyr", "ggplot2", "tidyr", "caret", "randomforest", "shiny", "rmarkdown"],
                machine_learning: ["supervised learning", "unsupervised learning", "deep learning", "reinforcement learning", "nlp", "computer vision", "time series analysis"],
                algorithms: ["linear regression", "logistic regression", "decision trees", "random forest", "svm", "neural networks", "clustering", "pca", "gradient boosting"],
                deep_learning: ["cnn", "rnn", "lstm", "gru", "transformer", "bert", "gpt", "autoencoder", "gan"],
                databases: ["postgresql", "mysql", "mongodb", "cassandra", "snowflake", "bigquery", "redshift"],
                big_data: ["apache spark", "hadoop", "kafka", "airflow", "databricks", "dask"],
                cloud_platforms: ["aws sagemaker", "google cloud ai", "azure ml", "databricks", "dataiku"],
                visualization: ["tableau", "power bi", "d3.js", "plotly dash", "streamlit", "jupyter notebooks"],
                statistics: ["hypothesis testing", "bayesian statistics", "a/b testing", "experimental design", "causal inference"],
                mlops: ["mlflow", "kubeflow", "docker", "kubernetes", "model versioning", "monitoring"],
                tools: ["jupyter", "anaconda", "git", "docker", "kubernetes"]
            },

            // DevOps Engineer
            "devops engineer": {
                containerization: ["docker", "podman", "containerd", "docker compose", "docker swarm"],
                orchestration: ["kubernetes", "openshift", "rancher", "nomad", "docker swarm"],
                cloud_platforms: ["aws", "azure", "gcp", "alibaba cloud", "digital ocean", "linode"],
                infrastructure_as_code: ["terraform", "ansible", "puppet", "chef", "cloudformation", "arm templates", "pulumi"],
                ci_cd: ["jenkins", "gitlab ci", "github actions", "azure devops", "circleci", "travis ci", "bamboo", "teamcity"],
                monitoring: ["prometheus", "grafana", "elk stack", "splunk", "datadog", "new relic", "nagios", "zabbix"],
                logging: ["elasticsearch", "logstash", "kibana", "fluentd", "graylog", "splunk"],
                scripting: ["bash", "python", "powershell", "groovy", "yaml", "json"],
                version_control: ["git", "svn", "mercurial", "perforce"],
                security: ["vault", "secrets management", "rbac", "network security", "compliance"],
                networking: ["load balancers", "reverse proxy", "cdn", "dns", "vpc", "firewalls"],
                databases: ["postgresql", "mysql", "mongodb", "redis", "backup strategies"],
                performance: ["load testing", "stress testing", "capacity planning", "optimization"],
                service_mesh: ["istio", "linkerd", "consul connect"],
                gitops: ["argocd", "flux", "jenkins x"]
            },

            // Mobile Developer
            "mobile developer": {
                native_ios: ["swift", "objective-c", "xcode", "cocoapods", "swift package manager", "core data", "uikit", "swiftui", "combine"],
                native_android: ["kotlin", "java", "android studio", "gradle", "room", "retrofit", "jetpack compose", "android architecture components"],
                cross_platform: ["flutter", "dart", "react native", "xamarin", "ionic", "cordova", "phonegap", "unity"],
                testing: ["xctest", "espresso", "junit", "mockito", "flutter test", "detox"],
                databases: ["sqlite", "realm", "core data", "room", "firebase firestore"],
                backend_services: ["firebase", "aws amplify", "supabase", "appwrite"],
                push_notifications: ["firebase cloud messaging", "apple push notification", "onesignal"],
                analytics: ["firebase analytics", "google analytics", "mixpanel", "amplitude"],
                app_stores: ["app store connect", "google play console", "app store optimization"],
                ui_ux: ["material design", "human interface guidelines", "responsive design"],
                performance: ["profiling", "memory management", "battery optimization"],
                security: ["ssl pinning", "keychain", "biometric authentication", "app transport security"],
                tools: ["xcode", "android studio", "visual studio code", "postman", "charles proxy"]
            },

            // Database Administrator
            "database administrator": {
                relational_databases: ["postgresql", "mysql", "oracle", "sql server", "db2", "mariadb", "sqlite"],
                nosql_databases: ["mongodb", "cassandra", "redis", "elasticsearch", "dynamodb", "couchdb", "neo4j"],
                sql_skills: ["query optimization", "indexing", "stored procedures", "triggers", "views", "functions"],
                performance_tuning: ["query optimization", "index tuning", "partitioning", "sharding", "caching"],
                backup_recovery: ["backup strategies", "point-in-time recovery", "disaster recovery", "replication"],
                security: ["user management", "role-based access", "encryption", "auditing", "compliance"],
                monitoring: ["database monitoring", "performance metrics", "alerting", "capacity planning"],
                replication: ["master-slave", "master-master", "read replicas", "clustering"],
                cloud_databases: ["amazon rds", "azure sql", "google cloud sql", "mongodb atlas", "dynamodb"],
                data_modeling: ["normalization", "denormalization", "er diagrams", "schema design"],
                migration: ["data migration", "schema migration", "version control", "change management"],
                scripting: ["sql", "python", "bash", "powershell", "perl"],
                tools: ["pgadmin", "mysql workbench", "mongodb compass", "datagrip", "dbeaver"],
                big_data: ["apache spark", "hadoop", "hive", "impala", "presto"]
            },

            // Cloud Engineer
            "cloud engineer": {
                aws_services: ["ec2", "s3", "rds", "lambda", "cloudfront", "route53", "iam", "vpc", "cloudwatch", "cloudformation", "ecs", "eks", "sagemaker"],
                azure_services: ["virtual machines", "storage", "sql database", "functions", "cdn", "active directory", "resource manager", "monitor", "kubernetes service"],
                gcp_services: ["compute engine", "cloud storage", "cloud sql", "cloud functions", "cloud cdn", "iam", "vpc", "stackdriver", "kubernetes engine"],
                infrastructure_as_code: ["terraform", "cloudformation", "arm templates", "deployment manager", "pulumi"],
                containerization: ["docker", "kubernetes", "openshift", "container registry"],
                networking: ["vpc", "subnets", "security groups", "load balancers", "cdn", "dns"],
                security: ["iam", "rbac", "encryption", "key management", "compliance", "security groups"],
                monitoring: ["cloudwatch", "azure monitor", "stackdriver", "prometheus", "grafana"],
                automation: ["lambda", "azure functions", "cloud functions", "step functions", "logic apps"],
                databases: ["rds", "dynamodb", "cosmosdb", "cloud sql", "bigquery"],
                ci_cd: ["codepipeline", "azure devops", "cloud build", "jenkins"],
                cost_optimization: ["cost analysis", "reserved instances", "spot instances", "rightsizing"],
                disaster_recovery: ["backup strategies", "multi-region deployment", "failover"],
                serverless: ["lambda", "api gateway", "azure functions", "cloud functions"],
                certifications: ["aws certified", "azure certified", "gcp certified"]
            },

            // Cybersecurity Specialist
            "cybersecurity specialist": {
                penetration_testing: ["metasploit", "burp suite", "nmap", "wireshark", "nessus", "openvas", "sqlmap", "nikto"],
                operating_systems: ["kali linux", "parrot os", "windows", "linux", "macos", "unix"],
                networking: ["tcp/ip", "dns", "dhcp", "vpn", "firewalls", "ids/ips", "network protocols"],
                security_frameworks: ["nist", "iso 27001", "pci dss", "hipaa", "gdpr", "sox", "cobit"],
                incident_response: ["forensics", "malware analysis", "threat hunting", "siem", "soar"],
                vulnerability_management: ["vulnerability scanning", "patch management", "risk assessment", "cve analysis"],
                cryptography: ["encryption", "hashing", "digital signatures", "pki", "ssl/tls", "aes", "rsa"],
                authentication: ["multi-factor authentication", "single sign-on", "ldap", "active directory", "oauth", "saml"],
                compliance: ["audit preparation", "policy development", "risk management", "governance"],
                cloud_security: ["aws security", "azure security", "gcp security", "cloud compliance"],
                application_security: ["secure coding", "code review", "static analysis", "dynamic analysis", "owasp top 10"],
                threat_intelligence: ["threat modeling", "attack vectors", "iocs", "ttps", "mitre att&ck"],
                security_tools: ["splunk", "qradar", "arcsight", "phantom", "carbonblack", "crowdstrike"],
                malware_analysis: ["static analysis", "dynamic analysis", "reverse engineering", "sandboxing"],
                social_engineering: ["phishing", "awareness training", "security culture"],
                mobile_security: ["ios security", "android security", "mobile device management"],
                scripting: ["python", "powershell", "bash", "perl", "ruby"]
            },

            // QA Engineer
            "qa engineer": {
                testing_types: ["functional testing", "regression testing", "integration testing", "system testing", "acceptance testing", "smoke testing"],
                automation_tools: ["selenium", "cypress", "playwright", "webdriver", "appium", "testcomplete", "katalon"],
                programming: ["java", "python", "javascript", "c#", "typescript"],
                frameworks: ["junit", "testng", "pytest", "mocha", "jasmine", "cucumber", "robot framework"],
                performance_testing: ["jmeter", "loadrunner", "gatling", "k6", "blazemeter"],
                api_testing: ["postman", "rest assured", "soapui", "insomnia", "newman"],
                mobile_testing: ["appium", "xamarin test", "espresso", "xcuitest"],
                test_management: ["jira", "testlink", "zephyr", "testrail", "qtest"],
                ci_cd: ["jenkins", "gitlab ci", "github actions", "azure devops"],
                databases: ["sql", "mysql", "postgresql", "oracle", "mongodb"],
                version_control: ["git", "svn"],
                agile_methodologies: ["scrum", "kanban", "safe"],
                security_testing: ["owasp zap", "burp suite", "sqlmap"],
                accessibility_testing: ["wave", "axe", "lighthouse", "screen readers"],
                cross_browser_testing: ["browserstack", "sauce labs", "lambdatest"],
                reporting: ["allure", "extent reports", "testng reports"]
            },

            // UI/UX Designer
            "ui/ux designer": {
                design_tools: ["figma", "sketch", "adobe xd", "invision", "principle", "framer", "protopie"],
                prototyping: ["figma", "sketch", "adobe xd", "invision", "marvel", "principle", "framer"],
                user_research: ["user interviews", "surveys", "usability testing", "a/b testing", "card sorting", "tree testing"],
                wireframing: ["balsamiq", "axure", "omnigraffle", "draw.io", "miro", "whimsical"],
                design_systems: ["atomic design", "component libraries", "style guides", "design tokens"],
                visual_design: ["typography", "color theory", "layout", "composition", "branding"],
                interaction_design: ["micro-interactions", "animations", "transitions", "user flows"],
                accessibility: ["wcag", "color contrast", "screen readers", "keyboard navigation"],
                frontend_basics: ["html", "css", "javascript", "responsive design"],
                collaboration: ["zeplin", "figma dev mode", "abstract", "version control"],
                analytics: ["google analytics", "hotjar", "fullstory", "mixpanel"],
                methodologies: ["design thinking", "human-centered design", "lean ux", "agile design"],
                mobile_design: ["ios guidelines", "material design", "responsive design"],
                web_design: ["responsive design", "progressive web apps", "cross-browser compatibility"],
                soft_skills: ["communication", "presentation", "stakeholder management", "empathy"]
            },

            // Product Manager
            "product manager": {
                strategy: ["product strategy", "roadmap planning", "okrs", "kpis", "competitive analysis"],
                user_research: ["user interviews", "surveys", "usability testing", "persona development", "journey mapping"],
                analytics: ["google analytics", "mixpanel", "amplitude", "segment", "hotjar", "fullstory"],
                project_management: ["agile", "scrum", "kanban", "jira", "asana", "monday.com", "notion"],
                design: ["figma", "sketch", "wireframing", "prototyping", "user experience"],
                technical_skills: ["sql", "html/css basics", "api understanding", "database concepts"],
                data_analysis: ["excel", "google sheets", "tableau", "power bi", "python basics", "r basics"],
                communication: ["stakeholder management", "presentation skills", "documentation", "requirements gathering"],
                market_research: ["competitor analysis", "market sizing", "customer development", "surveys"],
                metrics: ["product metrics", "user acquisition", "retention", "churn", "ltv", "cac"],
                experimentation: ["a/b testing", "hypothesis testing", "statistical significance", "experiment design"],
                tools: ["productboard", "aha!", "roadmunk", "pendo", "fullstory", "intercom"],
                methodologies: ["lean startup", "design thinking", "jobs-to-be-done", "user story mapping"],
                business_skills: ["business model canvas", "value proposition", "go-to-market strategy", "pricing"]
            }
        };

        // Enhanced function to suggest roles based on skills with intelligent scoring
        function suggestRoles(userSkills, topN = 5) {
            const results = [];

            for (const [role, details] of Object.entries(roleMapping)) {
                let allRoleSkills = [];
                let categoryScores = {};
                let totalPossibleMatches = 0;

                // Flatten skills by category and track category importance
                const categoryWeights = {
                    'core': 3,
                    'languages': 3,
                    'frameworks': 2.5,
                    'tools': 2,
                    'testing': 2,
                    'databases': 2,
                    'cloud_platforms': 2,
                    'security': 2,
                    'methodologies': 1.5,
                    'soft_skills': 1
                };

                // Process each category
                for (const [category, skills] of Object.entries(details)) {
                    if (Array.isArray(skills)) {
                        const normalizedCategorySkills = skills.map(s => s.toLowerCase());
                        allRoleSkills = allRoleSkills.concat(normalizedCategorySkills);

                        // Calculate matches for this category
                        const normalizedUserSkills = userSkills.map(s => s.toLowerCase());
                        let categoryMatches = 0;
                        let matchedSkills = [];

                        for (const userSkill of normalizedUserSkills) {
                            if (normalizedCategorySkills.includes(userSkill)) {
                                categoryMatches++;
                                matchedSkills.push(userSkill);
                            }
                        }

                        categoryScores[category] = {
                            matches: categoryMatches,
                            total: skills.length,
                            matchedSkills: matchedSkills,
                            weight: categoryWeights[category] || 1
                        };

                        totalPossibleMatches += skills.length;
                    }
                }

                // Calculate weighted score
                let weightedScore = 0;
                let totalMatches = 0;
                let allMatchedSkills = [];

                for (const [category, data] of Object.entries(categoryScores)) {
                    weightedScore += data.matches * data.weight;
                    totalMatches += data.matches;
                    allMatchedSkills = allMatchedSkills.concat(data.matchedSkills);
                }

                // Calculate percentage match
                const matchPercentage = totalPossibleMatches > 0 ?
                    Math.round((totalMatches / totalPossibleMatches) * 100) : 0;

                // Calculate relevance score (0-100)
                const maxPossibleScore = totalPossibleMatches * 3; // Assuming max weight of 3
                const relevanceScore = maxPossibleScore > 0 ?
                    Math.round((weightedScore / maxPossibleScore) * 100) : 0;

                // Only include roles with at least 1 match
                if (totalMatches > 0) {
                    results.push({
                        role: role,
                        matchCount: totalMatches,
                        totalSkills: totalPossibleMatches,
                        matchPercentage: matchPercentage,
                        relevanceScore: relevanceScore,
                        weightedScore: weightedScore,
                        matchedSkills: [...new Set(allMatchedSkills)], // Remove duplicates
                        categoryBreakdown: categoryScores,
                        recommendation: getRecommendation(matchPercentage, totalMatches)
                    });
                }
            }

            // Sort by relevance score first, then by match count
            results.sort((a, b) => {
                if (b.relevanceScore !== a.relevanceScore) {
                    return b.relevanceScore - a.relevanceScore;
                }
                return b.matchCount - a.matchCount;
            });

            return results.slice(0, topN);
        }

        // Helper function to provide recommendations
        function getRecommendation(matchPercentage, matchCount) {
            if (matchPercentage >= 70) {
                return "🎯 Excellent Match";
            } else if (matchPercentage >= 50) {
                return "✅ Good Match";
            } else if (matchPercentage >= 30) {
                return "📈 Potential Match";
            } else if (matchCount >= 5) {
                return "🌱 Emerging Match";
            } else {
                return "💡 Consider This";
            }
        }

        // Load existing data
        let candidates = JSON.parse(localStorage.getItem('candidates')) || [];
        renderTable();

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            const skillsInput = document.getElementById('skills').value;
            const skillsArray = skillsInput.split(',').map(skill => skill.trim());

            // Get top 5 role suggestions
            const roleSuggestions = suggestRoles(skillsArray, 5);

            const candidate = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                education: document.getElementById('education').value,
                skills: skillsInput,
                experience: document.getElementById('experience').value,
                suggestedRoles: roleSuggestions
            };

            candidates.push(candidate);
            localStorage.setItem('candidates', JSON.stringify(candidates));

            renderTable();
            form.reset();
        });

        function renderTable() {
            tableBody.innerHTML = '';
            candidates.forEach((c) => {
                // Format role suggestions for display
                let roleDisplay = 'No matching roles found';
                if (c.suggestedRoles && c.suggestedRoles.length > 0) {
                    roleDisplay = c.suggestedRoles.map((roleObj, index) => {
                        return `${index + 1}. ${roleObj.role} (${roleObj.matchPercentage}% match)`;
                    }).join('<br>');
                    roleDisplay = '<span class="role-suggestion">' + roleDisplay + '</span>';

                }

                const row = `<tr>
                    <td>${c.name}</td>
                    <td>${c.email}</td>
                    <td>${c.phone}</td>
                    <td>${c.education}</td>
                    <td>${c.skills}</td>
                    <td>${c.experience}</td>
                    <td>${roleDisplay}</td>
                </tr>`;
                tableBody.innerHTML += row;
            });
        }