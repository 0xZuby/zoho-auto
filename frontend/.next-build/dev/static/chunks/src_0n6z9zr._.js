(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/auditor/components/InstrumentPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InstrumentPanel",
    ()=>InstrumentPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function InstrumentPanel({ metrics, activeFilter, onSelectFilter }) {
    const kpis = metrics.kpis ?? {
        completionRate: 100,
        automationRate: 100,
        medianProvisioningMinutes: null,
        overdueRequests: 0,
        offboardingSlaRate: 100,
        urgentRevocationCount: 0,
        totalRequests: 0
    };
    const kpiCards = [
        {
            label: 'Completion rate',
            value: `${kpis.completionRate}%`,
            target: `${metrics.completed} of ${kpis.totalRequests} fulfilled`,
            tone: kpis.completionRate >= 80 ? 'good' : kpis.completionRate >= 50 ? 'warn' : 'neutral'
        },
        {
            label: 'Automation rate',
            value: `${kpis.automationRate}%`,
            target: 'Zero-exception rule match',
            tone: kpis.automationRate >= 85 ? 'good' : 'warn'
        },
        {
            label: 'Median provisioning',
            value: kpis.medianProvisioningMinutes !== null ? `${kpis.medianProvisioningMinutes}m` : '< 1m',
            target: 'Target SLA ≤ 15m',
            tone: kpis.medianProvisioningMinutes === null || kpis.medianProvisioningMinutes <= 15 ? 'good' : 'alert'
        },
        {
            label: 'Overdue requests',
            value: String(kpis.overdueRequests),
            target: 'Breached 15m / target date',
            tone: kpis.overdueRequests > 0 ? 'alert' : 'good',
            filterValue: 'OVERDUE'
        },
        {
            label: 'Offboarding SLA',
            value: `${kpis.offboardingSlaRate}%`,
            target: kpis.urgentRevocationCount > 0 ? `${kpis.urgentRevocationCount} active access risk` : 'Revoked within 15m of leave',
            tone: kpis.urgentRevocationCount > 0 || kpis.offboardingSlaRate < 100 ? 'alert' : 'good'
        }
    ];
    const queueCounters = [
        {
            label: 'To review',
            value: metrics.newRequests,
            tone: 'new',
            caption: 'Awaiting auditor decision',
            filterValue: 'PENDING_REVIEW'
        },
        {
            label: 'Failed / Blocked',
            value: metrics.failed,
            tone: 'alert',
            caption: 'Integration or partial error',
            filterValue: 'FAILED'
        },
        {
            label: 'Ready to create',
            value: metrics.readyToCreate,
            tone: 'progress',
            caption: 'Approved, awaiting API run',
            filterValue: 'APPROVED'
        },
        {
            label: 'Scheduled leave',
            value: metrics.scheduledOffboardings ?? 0,
            tone: 'progress',
            caption: 'Pending effective date',
            filterValue: 'SCHEDULED_OFFBOARDING'
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "kpi-overview-stack",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "kpi-slab",
                "aria-label": "System performance KPIs",
                children: kpiCards.map((item)=>{
                    const isInteractive = Boolean(item.filterValue);
                    const isActive = item.filterValue ? activeFilter === item.filterValue : false;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `kpi-cell kpi-tone-${item.tone}${isActive ? ' is-active' : ''}${isInteractive ? ' is-clickable' : ''}`,
                        onClick: item.filterValue ? ()=>onSelectFilter(isActive ? 'ALL' : item.filterValue) : undefined,
                        role: isInteractive ? 'button' : undefined,
                        tabIndex: isInteractive ? 0 : undefined,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "kpi-label",
                                children: item.label
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/components/InstrumentPanel.tsx",
                                lineNumber: 135,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                className: "kpi-figure",
                                children: item.value
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/components/InstrumentPanel.tsx",
                                lineNumber: 136,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "kpi-target",
                                children: item.target
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/components/InstrumentPanel.tsx",
                                lineNumber: 137,
                                columnNumber: 15
                            }, this)
                        ]
                    }, item.label, true, {
                        fileName: "[project]/src/app/auditor/components/InstrumentPanel.tsx",
                        lineNumber: 124,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/components/InstrumentPanel.tsx",
                lineNumber: 119,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "secondary-queue-bar",
                "aria-label": "Operational queue counters",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "secondary-queue-title",
                        children: "Queue status"
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/components/InstrumentPanel.tsx",
                        lineNumber: 144,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "secondary-queue-pills",
                        children: [
                            queueCounters.map((counter)=>{
                                const isActive = activeFilter === counter.filterValue;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: `secondary-queue-pill tone-${counter.tone}${isActive ? ' is-active' : ''}`,
                                    onClick: ()=>onSelectFilter(isActive ? 'ALL' : counter.filterValue),
                                    "aria-pressed": isActive,
                                    title: counter.caption,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "secondary-pill-dot"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/auditor/components/InstrumentPanel.tsx",
                                            lineNumber: 157,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "secondary-pill-label",
                                            children: counter.label
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/auditor/components/InstrumentPanel.tsx",
                                            lineNumber: 158,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            className: "secondary-pill-count",
                                            children: counter.value
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/auditor/components/InstrumentPanel.tsx",
                                            lineNumber: 159,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, counter.label, true, {
                                    fileName: "[project]/src/app/auditor/components/InstrumentPanel.tsx",
                                    lineNumber: 149,
                                    columnNumber: 15
                                }, this);
                            }),
                            activeFilter !== 'ALL' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "secondary-queue-reset",
                                onClick: ()=>onSelectFilter('ALL'),
                                children: "Reset filter"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/components/InstrumentPanel.tsx",
                                lineNumber: 164,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/components/InstrumentPanel.tsx",
                        lineNumber: 145,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/auditor/components/InstrumentPanel.tsx",
                lineNumber: 143,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/auditor/components/InstrumentPanel.tsx",
        lineNumber: 118,
        columnNumber: 5
    }, this);
}
_c = InstrumentPanel;
var _c;
__turbopack_context__.k.register(_c, "InstrumentPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/auditor/components/RequestQueueTable.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LifecyclePipelineMini",
    ()=>LifecyclePipelineMini,
    "RequestQueueTable",
    ()=>RequestQueueTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auditor-api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$statusPresentation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/auditor/statusPresentation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$components$2f$icons$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/auditor/components/icons.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
const STATUS_FILTERS = [
    {
        value: 'ALL',
        label: 'All statuses'
    },
    {
        value: 'PENDING_REVIEW',
        label: 'New'
    },
    {
        value: 'APPROVED',
        label: 'Approved'
    },
    {
        value: 'PROVISIONING',
        label: 'Provisioning'
    },
    {
        value: 'SCHEDULED_OFFBOARDING',
        label: 'Scheduled leave'
    },
    {
        value: 'PROVISIONING_FAILED',
        label: 'Failed'
    },
    {
        value: 'PARTIALLY_PROVISIONED',
        label: 'Partial'
    },
    {
        value: 'COMPLETED',
        label: 'Completed'
    },
    {
        value: 'ACCESS_REVOKED',
        label: 'Access disabled'
    }
];
const ACTION_QUEUE_STATUS_FILTERS = [
    {
        value: 'ALL',
        label: 'All active'
    },
    {
        value: 'OVERDUE',
        label: 'Overdue / SLA breach'
    },
    {
        value: 'PENDING_REVIEW',
        label: 'To review'
    },
    {
        value: 'FAILED',
        label: 'Failed / Blocked'
    },
    {
        value: 'APPROVED',
        label: 'Ready to create'
    },
    {
        value: 'SCHEDULED_OFFBOARDING',
        label: 'Scheduled leave'
    },
    {
        value: 'PROVISIONING',
        label: 'Creating…'
    },
    {
        value: 'ACCOUNT_CREATED',
        label: 'Send account info'
    },
    {
        value: 'RETURNED',
        label: 'Returned to HR'
    }
];
const EMPLOYEE_STATUS_FILTERS = [
    {
        value: 'ALL',
        label: 'All'
    },
    {
        value: 'ACTIVE',
        label: 'Active'
    },
    {
        value: 'NOT_WORKING',
        label: 'Not working'
    }
];
const DEFAULT_LIFECYCLE_STAGES = [
    {
        key: 'SUBMITTED',
        label: 'Submitted',
        state: 'done'
    },
    {
        key: 'VALIDATED',
        label: 'Validated',
        state: 'done'
    },
    {
        key: 'APPROVED',
        label: 'Approved',
        state: 'pending'
    },
    {
        key: 'ZOHO',
        label: 'Zoho',
        state: 'pending'
    },
    {
        key: 'INSIDEMAPS',
        label: 'InsideMaps',
        state: 'pending'
    },
    {
        key: 'VERIFIED',
        label: 'Verified',
        state: 'pending'
    }
];
function LifecyclePipelineMini({ stages }) {
    const list = stages && stages.length > 0 ? stages : DEFAULT_LIFECYCLE_STAGES;
    const currentOrFailed = list.find((s)=>s.state === 'failed' || s.state === 'blocked') ?? list.find((s)=>s.state === 'current') ?? [
        ...list
    ].reverse().find((s)=>s.state === 'done') ?? {
        key: 'SUBMITTED',
        label: 'Submitted',
        state: 'done'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "lifecycle-mini",
        "aria-label": "Request lifecycle stages",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "lifecycle-mini-track",
                children: list.map((stage)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `lifecycle-mini-seg state-${stage.state}`,
                        title: `${stage.label}: ${stage.state.toUpperCase()}`
                    }, stage.key, false, {
                        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                        lineNumber: 89,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `lifecycle-mini-caption state-${currentOrFailed.state}`,
                children: currentOrFailed.label
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                lineNumber: 96,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
        lineNumber: 86,
        columnNumber: 5
    }, this);
}
_c = LifecyclePipelineMini;
function RequestQueueTable({ requests, title = 'Request queue', subtitle, emptyMessage = 'New submissions will appear here.', viewAllHref, variant = 'default', statusFilter: controlledStatusFilter, onStatusFilterChange, onActionSuccess }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [internalStatusFilter, setInternalStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('ALL');
    const [busyId, setBusyId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [actionError, setActionError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [escalatedId, setEscalatedId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const statusFilter = controlledStatusFilter ?? internalStatusFilter;
    const setStatusFilter = onStatusFilterChange ?? setInternalStatusFilter;
    const isActionQueue = variant === 'action-queue';
    const isEmployeeDirectory = variant === 'employees';
    const statusFilterOptions = isActionQueue ? ACTION_QUEUE_STATUS_FILTERS : isEmployeeDirectory ? EMPLOYEE_STATUS_FILTERS : STATUS_FILTERS;
    const visibleRequests = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "RequestQueueTable.useMemo[visibleRequests]": ()=>{
            const normalizedQuery = query.trim().toLowerCase();
            const filtered = requests.filter({
                "RequestQueueTable.useMemo[visibleRequests].filtered": (request)=>{
                    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'OVERDUE' ? Boolean(request.isOverdue || request.isSlaBreached) : statusFilter === 'FAILED' ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$statusPresentation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FAILED_STATUSES"].includes(request.status) : statusFilter === 'NOT_WORKING' ? request.requestType === 'LEAVING_COMPANY' : statusFilter === 'ACTIVE' ? request.requestType !== 'LEAVING_COMPANY' : request.status === statusFilter);
                    const matchesQuery = !normalizedQuery || [
                        request.nameAndSurname,
                        request.requestCode,
                        request.department,
                        request.jobPosition,
                        request.proposedCorporateEmail,
                        request.blocker,
                        request.affectedSystem
                    ].filter(Boolean).some({
                        "RequestQueueTable.useMemo[visibleRequests].filtered": (value)=>String(value).toLowerCase().includes(normalizedQuery)
                    }["RequestQueueTable.useMemo[visibleRequests].filtered"]);
                    return matchesStatus && matchesQuery;
                }
            }["RequestQueueTable.useMemo[visibleRequests].filtered"]);
            return isActionQueue ? [
                ...filtered
            ].sort(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$statusPresentation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["compareByUrgency"]) : filtered;
        }
    }["RequestQueueTable.useMemo[visibleRequests]"], [
        isActionQueue,
        query,
        requests,
        statusFilter
    ]);
    const readout = subtitle ?? (requests.length === 0 ? 'No requests' : `${visibleRequests.length} of ${requests.length} · ${isActionQueue ? 'sorted by business risk & SLA breach' : 'newest first'}`);
    async function handleQuickAction(event, request, mode) {
        event.stopPropagation();
        setActionError(null);
        setBusyId(request.id);
        try {
            if (mode === 'APPROVE') {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["quickApproveRequest"])(request.id);
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["provisionRequest"])(request.id);
            } else if (mode === 'PROVISION') {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["provisionRequest"])(request.id);
            } else if (mode === 'RETRY') {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["retryProvisioning"])(request.id);
            } else if (mode === 'NOTIFY') {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sendAccountNotification"])(request.id);
            } else if (mode === 'ESCALATE') {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["escalateRequest"])(request.id, 'Escalated from Needs You queue due to risk / SLA breach.');
                setEscalatedId(request.id);
            }
            onActionSuccess?.();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Could not complete quick action.');
        } finally{
            setBusyId(null);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "queue-panel",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "queue-heading",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                lineNumber: 203,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: readout
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                lineNumber: 204,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                        lineNumber: 202,
                        columnNumber: 9
                    }, this),
                    requests.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "queue-toolbar",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "queue-search",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$components$2f$icons$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SearchIcon"], {}, void 0, false, {
                                        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                        lineNumber: 210,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "sr-only",
                                        htmlFor: "queue-search-input",
                                        children: "Search requests"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                        lineNumber: 211,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        id: "queue-search-input",
                                        value: query,
                                        onChange: (event)=>setQuery(event.target.value),
                                        placeholder: "Name, code, blocker, system…"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                        lineNumber: 214,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                lineNumber: 209,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "sr-only",
                                htmlFor: "queue-status-filter",
                                children: "Filter by status"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                lineNumber: 222,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                id: "queue-status-filter",
                                className: "queue-select",
                                value: statusFilter,
                                onChange: (event)=>setStatusFilter(event.target.value),
                                children: statusFilterOptions.map((filter)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: filter.value,
                                        children: filter.label
                                    }, filter.value, false, {
                                        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                        lineNumber: 232,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                lineNumber: 225,
                                columnNumber: 13
                            }, this),
                            viewAllHref && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: viewAllHref,
                                className: "queue-link",
                                children: [
                                    "View all",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$components$2f$icons$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ChevronRightIcon"], {}, void 0, false, {
                                        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                        lineNumber: 241,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                lineNumber: 239,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                        lineNumber: 208,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                lineNumber: 201,
                columnNumber: 7
            }, this),
            actionError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "notice notice-error",
                style: {
                    margin: '0 20px 12px'
                },
                children: actionError
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                lineNumber: 249,
                columnNumber: 9
            }, this),
            requests.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "queue-empty",
                children: emptyMessage
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                lineNumber: 255,
                columnNumber: 9
            }, this) : visibleRequests.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "queue-empty",
                children: "No requests match those filters. Try a broader search."
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                lineNumber: 257,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "queue-scroll",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "queue-table",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "queue-spine",
                                        "aria-hidden": true
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                        lineNumber: 263,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        scope: "col",
                                        children: "Employee"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                        lineNumber: 264,
                                        columnNumber: 17
                                    }, this),
                                    isActionQueue ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                scope: "col",
                                                children: "Lifecycle"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                lineNumber: 267,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                scope: "col",
                                                children: "Blocker & System"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                lineNumber: 268,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                scope: "col",
                                                className: "hide-narrow",
                                                children: "SLA / Deadline"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                lineNumber: 269,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                scope: "col",
                                                children: "Next Action"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                lineNumber: 270,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                        lineNumber: 266,
                                        columnNumber: 19
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                scope: "col",
                                                children: "Role & Dept"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                lineNumber: 274,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                scope: "col",
                                                className: "hide-narrow",
                                                children: "Account"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                lineNumber: 275,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                scope: "col",
                                                className: "hide-narrow",
                                                children: "Submitted"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                lineNumber: 276,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                scope: "col",
                                                children: "Status"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                lineNumber: 277,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                        lineNumber: 273,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                lineNumber: 262,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                            lineNumber: 261,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: visibleRequests.map((request)=>{
                                const presentation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$statusPresentation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStatusPresentation"])(request.status);
                                const openRequest = ()=>router.push(`/auditor/requests/${request.id}`);
                                const isBusy = busyId === request.id;
                                const riskLevel = request.riskLevel ?? 'LOW';
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: `tone-${presentation.tone}`,
                                    onClick: openRequest,
                                    onKeyDown: (event)=>{
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            openRequest();
                                        }
                                    },
                                    tabIndex: 0,
                                    "aria-label": `Open request ${request.requestCode} for ${request.nameAndSurname}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "queue-spine"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                            lineNumber: 303,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "queue-person",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "queue-name",
                                                        children: request.nameAndSurname
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                        lineNumber: 306,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "queue-code",
                                                        children: [
                                                            request.requestCode,
                                                            ` · ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$statusPresentation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["REQUEST_TYPE_LABELS"][request.requestType] ?? request.requestType}`,
                                                            isActionQueue && riskLevel !== 'LOW' ? ` · ${riskLevel}` : ''
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                        lineNumber: 307,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                lineNumber: 305,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                            lineNumber: 304,
                                            columnNumber: 21
                                        }, this),
                                        isActionQueue ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LifecyclePipelineMini, {
                                                        stages: request.lifecycleStages
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                        lineNumber: 318,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                    lineNumber: 317,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "queue-blocker-cell",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "queue-blocker-text",
                                                                style: {
                                                                    color: 'var(--ink)',
                                                                    fontWeight: 500
                                                                },
                                                                children: request.blocker || request.failureReason || 'Ready for next step'
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                                lineNumber: 323,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "queue-code",
                                                                children: [
                                                                    request.affectedSystem || request.accountType || 'PORTAL',
                                                                    ` · ${presentation.label} (${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$statusPresentation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getWhoActsNext"])(request.status)})`
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                                lineNumber: 326,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                        lineNumber: 322,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                    lineNumber: 321,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "hide-narrow",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "queue-deadline-cell",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "queue-time",
                                                                children: [
                                                                    "Wait: ",
                                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$statusPresentation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatWaitingDuration"])(request.submittedAt),
                                                                    request.isSlaBreached && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            color: 'var(--danger)',
                                                                            fontWeight: 600
                                                                        },
                                                                        children: ' · SLA breach'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                                        lineNumber: 338,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                                lineNumber: 335,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "queue-code",
                                                                children: [
                                                                    request.effectiveLeaveDate ? `Leave: ${request.effectiveLeaveDate}` : request.startDate ? `Start: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$statusPresentation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCompactDateTime"])(`${request.startDate}T00:00:00`)}` : request.deadlineIso ? `Due: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$statusPresentation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCompactDateTime"])(request.deadlineIso)}` : 'SLA: 15m',
                                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$statusPresentation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isStartDateUrgent"])(request.startDate) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            color: 'var(--danger)'
                                                                        },
                                                                        children: ' · Urgent'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                                        lineNumber: 352,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                                lineNumber: 343,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                        lineNumber: 334,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                    lineNumber: 333,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    onClick: (e)=>e.stopPropagation(),
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "queue-inline-actions",
                                                        children: [
                                                            request.status === 'PENDING_REVIEW' && !request.needsReview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                className: "btn btn-primary btn-xs",
                                                                disabled: isBusy,
                                                                onClick: (e)=>handleQuickAction(e, request, 'APPROVE'),
                                                                title: "Approve proposal & run provisioning",
                                                                children: isBusy ? 'Running…' : 'Approve & Run'
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                                lineNumber: 363,
                                                                columnNumber: 31
                                                            }, this),
                                                            (request.status === 'APPROVED' || request.status === 'SCHEDULED_OFFBOARDING') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                className: "btn btn-primary btn-xs",
                                                                disabled: isBusy,
                                                                onClick: (e)=>handleQuickAction(e, request, 'PROVISION'),
                                                                children: isBusy ? 'Running…' : request.requestType === 'LEAVING_COMPANY' ? 'Revoke Access' : 'Provision'
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                                lineNumber: 375,
                                                                columnNumber: 31
                                                            }, this),
                                                            (request.status === 'PROVISIONING_FAILED' || request.status === 'PARTIALLY_PROVISIONED') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                className: "btn btn-danger btn-xs",
                                                                disabled: isBusy,
                                                                onClick: (e)=>handleQuickAction(e, request, 'RETRY'),
                                                                children: isBusy ? 'Retrying…' : 'Retry Step'
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                                lineNumber: 390,
                                                                columnNumber: 31
                                                            }, this),
                                                            request.status === 'ACCOUNT_CREATED' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                className: "btn btn-primary btn-xs",
                                                                disabled: isBusy,
                                                                onClick: (e)=>handleQuickAction(e, request, 'NOTIFY'),
                                                                children: isBusy ? 'Sending…' : 'Send Invite'
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                                lineNumber: 401,
                                                                columnNumber: 31
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                className: "btn btn-secondary btn-xs",
                                                                onClick: openRequest,
                                                                children: "Investigate"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                                lineNumber: 411,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                className: "btn btn-ghost btn-xs",
                                                                disabled: isBusy || escalatedId === request.id,
                                                                onClick: (e)=>handleQuickAction(e, request, 'ESCALATE'),
                                                                title: "Record priority escalation in audit log",
                                                                children: escalatedId === request.id ? 'Escalated' : 'Escalate'
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                                lineNumber: 419,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                        lineNumber: 361,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                    lineNumber: 360,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                            lineNumber: 316,
                                            columnNumber: 23
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "queue-muted",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "queue-person",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    color: 'var(--ink)',
                                                                    fontSize: 13.5,
                                                                    fontWeight: 500
                                                                },
                                                                children: request.jobPosition || '—'
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                                lineNumber: 435,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "queue-code",
                                                                children: request.department || '—'
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                                lineNumber: 438,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                        lineNumber: 434,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                    lineNumber: 433,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "hide-narrow",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "queue-code",
                                                        children: [
                                                            request.proposedCorporateEmail || '—',
                                                            request.accountType ? ` · ${request.accountType}` : ''
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                        lineNumber: 442,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                    lineNumber: 441,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "hide-narrow",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "queue-time",
                                                        children: request.effectiveLeaveDate ? `Leave: ${request.effectiveLeaveDate}` : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$statusPresentation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCompactDateTime"])(request.submittedAt)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                        lineNumber: 448,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                    lineNumber: 447,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "queue-status",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "queue-state",
                                                                children: presentation.label
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                                lineNumber: 456,
                                                                columnNumber: 29
                                                            }, this),
                                                            request.collisionAdjusted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "queue-flag",
                                                                title: "Email suffix adjusted for collision",
                                                                children: "Suffix"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                                lineNumber: 458,
                                                                columnNumber: 31
                                                            }, this),
                                                            request.needsReview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "queue-flag",
                                                                title: "The rules engine could not map this request automatically",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$components$2f$icons$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FlagIcon"], {}, void 0, false, {
                                                                        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                                        lineNumber: 464,
                                                                        columnNumber: 33
                                                                    }, this),
                                                                    "Review"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                                lineNumber: 463,
                                                                columnNumber: 31
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                        lineNumber: 455,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                                    lineNumber: 454,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                            lineNumber: 432,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, request.id, true, {
                                    fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                                    lineNumber: 290,
                                    columnNumber: 19
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                            lineNumber: 282,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                    lineNumber: 260,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
                lineNumber: 259,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/auditor/components/RequestQueueTable.tsx",
        lineNumber: 200,
        columnNumber: 5
    }, this);
}
_s(RequestQueueTable, "ZKHQkk+NtWMXIraAhMxJSBwyStQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c1 = RequestQueueTable;
var _c, _c1;
__turbopack_context__.k.register(_c, "LifecyclePipelineMini");
__turbopack_context__.k.register(_c1, "RequestQueueTable");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/auditor/components/RequestTypeBreakdown.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RequestTypeBreakdown",
    ()=>RequestTypeBreakdown
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$statusPresentation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/auditor/statusPresentation.ts [app-client] (ecmascript)");
;
;
;
const TYPE_ORDER = [
    'NEW_HIRE',
    'LEAVING_COMPANY',
    'UPDATE_EMPLOYEE_INFO'
];
const TYPE_LINKS = {
    NEW_HIRE: '/auditor/employees/onboarding',
    LEAVING_COMPANY: '/auditor/employees/offboarding',
    UPDATE_EMPLOYEE_INFO: '/auditor/employees/all'
};
function RequestTypeBreakdown({ metrics }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "card card-padded stack gap-16",
        "aria-label": "Requests by type",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "row-between",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    style: {
                        fontSize: 15
                    },
                    children: "Requests by type"
                }, void 0, false, {
                    fileName: "[project]/src/app/auditor/components/RequestTypeBreakdown.tsx",
                    lineNumber: 23,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/components/RequestTypeBreakdown.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "type-breakdown-grid",
                children: TYPE_ORDER.map((type)=>{
                    const typeMetrics = metrics.byType[type];
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: TYPE_LINKS[type],
                        className: "type-breakdown-cell",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "type-breakdown-label",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$statusPresentation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["REQUEST_TYPE_LABELS"][type]
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/components/RequestTypeBreakdown.tsx",
                                lineNumber: 31,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                className: "type-breakdown-total",
                                children: typeMetrics.total
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/components/RequestTypeBreakdown.tsx",
                                lineNumber: 32,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                                className: "type-breakdown-stats",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                children: "New"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/components/RequestTypeBreakdown.tsx",
                                                lineNumber: 35,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                children: typeMetrics.pending
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/components/RequestTypeBreakdown.tsx",
                                                lineNumber: 36,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/auditor/components/RequestTypeBreakdown.tsx",
                                        lineNumber: 34,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                children: "In progress"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/components/RequestTypeBreakdown.tsx",
                                                lineNumber: 39,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                children: typeMetrics.provisioning
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/components/RequestTypeBreakdown.tsx",
                                                lineNumber: 40,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/auditor/components/RequestTypeBreakdown.tsx",
                                        lineNumber: 38,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                children: "Failed"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/components/RequestTypeBreakdown.tsx",
                                                lineNumber: 43,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                children: typeMetrics.failed
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/components/RequestTypeBreakdown.tsx",
                                                lineNumber: 44,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/auditor/components/RequestTypeBreakdown.tsx",
                                        lineNumber: 42,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                children: "Completed"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/components/RequestTypeBreakdown.tsx",
                                                lineNumber: 47,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                children: typeMetrics.completed
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/components/RequestTypeBreakdown.tsx",
                                                lineNumber: 48,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/auditor/components/RequestTypeBreakdown.tsx",
                                        lineNumber: 46,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auditor/components/RequestTypeBreakdown.tsx",
                                lineNumber: 33,
                                columnNumber: 15
                            }, this)
                        ]
                    }, type, true, {
                        fileName: "[project]/src/app/auditor/components/RequestTypeBreakdown.tsx",
                        lineNumber: 30,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/components/RequestTypeBreakdown.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/auditor/components/RequestTypeBreakdown.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
_c = RequestTypeBreakdown;
var _c;
__turbopack_context__.k.register(_c, "RequestTypeBreakdown");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SecurityOffboardingWatch",
    ()=>SecurityOffboardingWatch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auditor-api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$statusPresentation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/auditor/statusPresentation.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function SecurityOffboardingWatch({ requests, onActionSuccess }) {
    _s();
    const [busyId, setBusyId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [runningDue, setRunningDue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const offboardingRequests = requests.filter((r)=>r.requestType === 'LEAVING_COMPANY');
    const criticalIncidents = offboardingRequests.filter((r)=>r.activeAccessWarning || r.status === 'PROVISIONING_FAILED' || r.status === 'PARTIALLY_PROVISIONED');
    const activeScheduled = offboardingRequests.filter((r)=>!criticalIncidents.includes(r) && r.status !== 'ACCESS_REVOKED' && r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
    async function handleRevokeOrRetry(request) {
        setBusyId(request.id);
        try {
            if (request.status === 'PENDING_REVIEW' && !request.needsReview) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["quickApproveRequest"])(request.id);
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["provisionRequest"])(request.id);
            } else if (request.status === 'APPROVED' || request.status === 'SCHEDULED_OFFBOARDING') {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["provisionRequest"])(request.id);
            } else if (request.status === 'PROVISIONING_FAILED' || request.status === 'PARTIALLY_PROVISIONED') {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["retryProvisioning"])(request.id);
            }
            onActionSuccess?.();
        } finally{
            setBusyId(null);
        }
    }
    async function handleEscalate(request) {
        setBusyId(request.id);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["escalateRequest"])(request.id, 'Urgent access revocation incident escalated from Security Watch.');
            onActionSuccess?.();
        } finally{
            setBusyId(null);
        }
    }
    async function handleRunDue() {
        setRunningDue(true);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["runDueOffboardings"])();
            onActionSuccess?.();
        } finally{
            setRunningDue(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: `security-watch-panel${criticalIncidents.length > 0 ? ' has-incident' : ''}`,
        "aria-label": "Security and offboarding watch",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "security-watch-header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "security-watch-title-group",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `security-watch-badge${criticalIncidents.length > 0 ? ' is-critical' : ' is-clear'}`,
                                children: criticalIncidents.length > 0 ? `CRITICAL ACCESS RISK (${criticalIncidents.length})` : 'SECURITY & OFFBOARDING WATCH'
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                lineNumber: 92,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                children: criticalIncidents.length > 0 ? 'Departed employee access still active — immediate revocation required' : activeScheduled.length > 0 ? `${activeScheduled.length} scheduled or pending access revocation(s)` : 'Zero unrevoked leaver accounts — all offboarding SLAs compliant'
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                lineNumber: 97,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "security-watch-actions",
                        children: [
                            activeScheduled.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "btn btn-secondary btn-xs",
                                disabled: runningDue,
                                onClick: handleRunDue,
                                children: runningDue ? 'Checking due…' : 'Run due offboardings'
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                lineNumber: 108,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/auditor/employees/offboarding",
                                className: "queue-link",
                                children: "Offboarding queue →"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                lineNumber: 117,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                        lineNumber: 106,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                lineNumber: 90,
                columnNumber: 7
            }, this),
            criticalIncidents.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "security-incident-list",
                children: criticalIncidents.map((incident)=>{
                    const isBusy = busyId === incident.id;
                    const presentation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$statusPresentation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStatusPresentation"])(incident.status);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "security-incident-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "security-incident-main",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "row gap-8",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "risk-badge risk-CRITICAL",
                                                children: "CRITICAL INCIDENT"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                                lineNumber: 132,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: incident.nameAndSurname
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                                lineNumber: 133,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "mono text-xs text-muted",
                                                children: incident.requestCode
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                                lineNumber: 134,
                                                columnNumber: 21
                                            }, this),
                                            incident.proposedCorporateEmail && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "mono text-xs text-muted",
                                                children: [
                                                    "· ",
                                                    incident.proposedCorporateEmail
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                                lineNumber: 136,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                        lineNumber: 131,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "security-incident-reason",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: [
                                                    "Blocker (",
                                                    incident.affectedSystem || 'ZOHO / INSIDEMAPS',
                                                    "):"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                                lineNumber: 140,
                                                columnNumber: 21
                                            }, this),
                                            ' ',
                                            incident.blocker || incident.failureReason || 'Access revocation failed or overdue',
                                            " · Effective leave:",
                                            ' ',
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "mono",
                                                children: incident.effectiveLeaveDate || 'Immediate'
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                                lineNumber: 142,
                                                columnNumber: 21
                                            }, this),
                                            " · Waiting",
                                            ' ',
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "mono",
                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$statusPresentation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatWaitingDuration"])(incident.submittedAt)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                                lineNumber: 143,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                        lineNumber: 139,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                lineNumber: 130,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "security-incident-controls",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "queue-state",
                                        children: presentation.label
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                        lineNumber: 148,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "btn btn-danger btn-xs",
                                        disabled: isBusy,
                                        onClick: ()=>handleRevokeOrRetry(incident),
                                        children: isBusy ? 'Revoking…' : 'Retry revocation now'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                        lineNumber: 149,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "btn btn-secondary btn-xs",
                                        disabled: isBusy,
                                        onClick: ()=>handleEscalate(incident),
                                        children: "Escalate"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                        lineNumber: 157,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: `/auditor/requests/${incident.id}`,
                                        className: "btn btn-secondary btn-xs",
                                        children: "Investigate"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                        lineNumber: 165,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                lineNumber: 147,
                                columnNumber: 17
                            }, this)
                        ]
                    }, incident.id, true, {
                        fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                        lineNumber: 129,
                        columnNumber: 15
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                lineNumber: 124,
                columnNumber: 9
            }, this),
            criticalIncidents.length === 0 && activeScheduled.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "security-scheduled-strip",
                children: activeScheduled.slice(0, 3).map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "security-scheduled-item",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: item.nameAndSurname
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                        lineNumber: 180,
                                        columnNumber: 17
                                    }, this),
                                    ' ',
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "mono text-xs text-muted",
                                        children: [
                                            "(",
                                            item.proposedCorporateEmail || item.requestCode,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                        lineNumber: 181,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                lineNumber: 179,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "row gap-12",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "mono text-xs",
                                        children: [
                                            "Effective: ",
                                            item.effectiveLeaveDate || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$statusPresentation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCompactDateTime"])(item.deadlineIso ?? null),
                                            " (",
                                            item.effectiveLeaveTimezone || 'UTC',
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                        lineNumber: 184,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "btn btn-secondary btn-xs",
                                        disabled: busyId === item.id,
                                        onClick: ()=>handleRevokeOrRetry(item),
                                        children: busyId === item.id ? 'Running…' : 'Revoke now'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                        lineNumber: 187,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: `/auditor/requests/${item.id}`,
                                        className: "queue-link",
                                        children: "Inspect"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                        lineNumber: 195,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                                lineNumber: 183,
                                columnNumber: 15
                            }, this)
                        ]
                    }, item.id, true, {
                        fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                        lineNumber: 178,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
                lineNumber: 176,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx",
        lineNumber: 86,
        columnNumber: 5
    }, this);
}
_s(SecurityOffboardingWatch, "9PrT6EBOQSDqmnkbYpSy92BHzw4=");
_c = SecurityOffboardingWatch;
var _c;
__turbopack_context__.k.register(_c, "SecurityOffboardingWatch");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/auditor/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AuditorHomePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auditor-api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$AuditorUserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/auditor/AuditorUserContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$components$2f$InstrumentPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/auditor/components/InstrumentPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$components$2f$Placeholder$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/auditor/components/Placeholder.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$components$2f$RequestQueueTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/auditor/components/RequestQueueTable.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$components$2f$RequestTypeBreakdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/auditor/components/RequestTypeBreakdown.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$components$2f$SecurityOffboardingWatch$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/auditor/components/SecurityOffboardingWatch.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$statusPresentation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/auditor/statusPresentation.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
function AuditorHomePage() {
    _s();
    const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$AuditorUserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuditorUser"])();
    const [metrics, setMetrics] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [requests, setRequests] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loadError, setLoadError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [queueStatusFilter, setQueueStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('ALL');
    const refreshDashboard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuditorHomePage.useCallback[refreshDashboard]": async ()=>{
            try {
                const [metricsResult, requestsResult] = await Promise.all([
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMetrics"])(),
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listRequests"])()
                ]);
                setMetrics(metricsResult);
                setRequests(requestsResult);
                setLoadError(null);
            } catch  {
                setLoadError('Could not load the dashboard. Refresh the page to try again.');
            }
        }
    }["AuditorHomePage.useCallback[refreshDashboard]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuditorHomePage.useEffect": ()=>{
            refreshDashboard();
        }
    }["AuditorHomePage.useEffect"], [
        refreshDashboard
    ]);
    // Home is action-first (PRD section 8): only current (non-superseded)
    // requests still needing someone's attention show up here.
    const actionQueueRequests = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AuditorHomePage.useMemo[actionQueueRequests]": ()=>{
            if (!requests) return null;
            const supersededIds = new Set(requests.map({
                "AuditorHomePage.useMemo[actionQueueRequests]": (request)=>request.previousRequestId
            }["AuditorHomePage.useMemo[actionQueueRequests]"]).filter(Boolean));
            return requests.filter({
                "AuditorHomePage.useMemo[actionQueueRequests]": (request)=>!supersededIds.has(request.id) && __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$statusPresentation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NEEDS_ACTION_STATUSES"].includes(request.status)
            }["AuditorHomePage.useMemo[actionQueueRequests]"]);
        }
    }["AuditorHomePage.useMemo[actionQueueRequests]"], [
        requests
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "ops-main",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "ops-intro",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                children: "Home"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/page.tsx",
                                lineNumber: 50,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    "Hi ",
                                    user.name.split(' ')[0],
                                    ", here’s what’s waiting across onboarding and offboarding today."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auditor/page.tsx",
                                lineNumber: 51,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/page.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "ops-date",
                        children: new Intl.DateTimeFormat(undefined, {
                            dateStyle: 'medium'
                        }).format(new Date())
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/page.tsx",
                        lineNumber: 55,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/auditor/page.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            loadError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "notice notice-error",
                children: loadError
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/page.tsx",
                lineNumber: 60,
                columnNumber: 21
            }, this),
            metrics ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$components$2f$InstrumentPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["InstrumentPanel"], {
                metrics: metrics,
                activeFilter: queueStatusFilter,
                onSelectFilter: setQueueStatusFilter
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/page.tsx",
                lineNumber: 63,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$components$2f$Placeholder$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Placeholder"], {
                height: 132,
                label: "Reading volume"
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/page.tsx",
                lineNumber: 65,
                columnNumber: 9
            }, this),
            requests && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$components$2f$SecurityOffboardingWatch$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SecurityOffboardingWatch"], {
                requests: requests,
                onActionSuccess: refreshDashboard
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/page.tsx",
                lineNumber: 69,
                columnNumber: 9
            }, this),
            metrics ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$components$2f$RequestTypeBreakdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RequestTypeBreakdown"], {
                metrics: metrics
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/page.tsx",
                lineNumber: 72,
                columnNumber: 18
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$components$2f$Placeholder$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Placeholder"], {
                height: 160,
                label: "Reading breakdown"
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/page.tsx",
                lineNumber: 72,
                columnNumber: 63
            }, this),
            actionQueueRequests ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$components$2f$RequestQueueTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RequestQueueTable"], {
                requests: actionQueueRequests,
                title: "Needs you",
                variant: "action-queue",
                statusFilter: queueStatusFilter,
                onStatusFilterChange: setQueueStatusFilter,
                onActionSuccess: refreshDashboard,
                emptyMessage: "Nothing needs your attention right now.",
                viewAllHref: "/auditor/employees/all"
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/page.tsx",
                lineNumber: 75,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$components$2f$Placeholder$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Placeholder"], {
                height: 280,
                label: "Loading queue",
                className: "is-queue"
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/page.tsx",
                lineNumber: 86,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/auditor/page.tsx",
        lineNumber: 47,
        columnNumber: 5
    }, this);
}
_s(AuditorHomePage, "T/SCFi/kgZV2un2wDD323EsH+oQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$AuditorUserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuditorUser"]
    ];
});
_c = AuditorHomePage;
var _c;
__turbopack_context__.k.register(_c, "AuditorHomePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/auditor/statusPresentation.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FAILED_STATUSES",
    ()=>FAILED_STATUSES,
    "NEEDS_ACTION_STATUSES",
    ()=>NEEDS_ACTION_STATUSES,
    "REQUEST_TYPE_LABELS",
    ()=>REQUEST_TYPE_LABELS,
    "compareByUrgency",
    ()=>compareByUrgency,
    "formatCompactDateTime",
    ()=>formatCompactDateTime,
    "formatDateTime",
    ()=>formatDateTime,
    "formatWaitingDuration",
    ()=>formatWaitingDuration,
    "getStatusPresentation",
    ()=>getStatusPresentation,
    "getWhoActsNext",
    ()=>getWhoActsNext,
    "isStartDateUrgent",
    ()=>isStartDateUrgent
]);
const STATUS_PRESENTATION = {
    INVITED: {
        label: 'Invited',
        tone: 'idle',
        chipClassName: 'chip-neutral'
    },
    FORM_OPENED: {
        label: 'Form opened',
        tone: 'idle',
        chipClassName: 'chip-neutral'
    },
    SUBMITTED: {
        label: 'Submitted',
        tone: 'new',
        chipClassName: 'chip-info'
    },
    PENDING_REVIEW: {
        label: 'New',
        tone: 'new',
        chipClassName: 'chip-info'
    },
    APPROVED: {
        label: 'Approved',
        tone: 'progress',
        chipClassName: 'chip-info'
    },
    PROVISIONING: {
        label: 'Provisioning',
        tone: 'progress',
        chipClassName: 'chip-warning'
    },
    ACCOUNT_CREATED: {
        label: 'Account created',
        tone: 'progress',
        chipClassName: 'chip-success'
    },
    NOTIFICATION_SENT: {
        label: 'Notified',
        tone: 'done',
        chipClassName: 'chip-success'
    },
    COMPLETED: {
        label: 'Completed',
        tone: 'done',
        chipClassName: 'chip-success'
    },
    ACCESS_REVOKED: {
        label: 'Access disabled',
        tone: 'done',
        chipClassName: 'chip-success'
    },
    SCHEDULED_OFFBOARDING: {
        label: 'Scheduled leave',
        tone: 'progress',
        chipClassName: 'chip-info'
    },
    REJECTED: {
        label: 'Rejected',
        tone: 'idle',
        chipClassName: 'chip-danger'
    },
    RETURNED: {
        label: 'Returned',
        tone: 'alert',
        chipClassName: 'chip-warning'
    },
    PROVISIONING_FAILED: {
        label: 'Failed',
        tone: 'alert',
        chipClassName: 'chip-danger'
    },
    PARTIALLY_PROVISIONED: {
        label: 'Partial',
        tone: 'alert',
        chipClassName: 'chip-danger'
    },
    CANCELLED: {
        label: 'Cancelled',
        tone: 'idle',
        chipClassName: 'chip-neutral'
    }
};
function getStatusPresentation(status) {
    return STATUS_PRESENTATION[status] ?? {
        label: status,
        tone: 'idle',
        chipClassName: 'chip-neutral'
    };
}
/**
 * Who acts next for a given status (PRD section 16, "Display labels" table).
 * Drives the dashboard queue's "Acts next" column so an auditor can tell at
 * a glance whether a row is waiting on them, on HR, or on the system.
 */ const WHO_ACTS_NEXT = {
    PENDING_REVIEW: 'Auditor',
    APPROVED: 'Auditor',
    PROVISIONING: 'System',
    SCHEDULED_OFFBOARDING: 'Scheduled',
    ACCOUNT_CREATED: 'Auditor',
    PARTIALLY_PROVISIONED: 'Auditor',
    PROVISIONING_FAILED: 'Auditor',
    RETURNED: 'HR'
};
function getWhoActsNext(status) {
    return WHO_ACTS_NEXT[status] ?? '—';
}
const FAILED_STATUSES = [
    'PROVISIONING_FAILED',
    'PARTIALLY_PROVISIONED'
];
const NEEDS_ACTION_STATUSES = [
    'PENDING_REVIEW',
    'APPROVED',
    'PROVISIONING',
    'SCHEDULED_OFFBOARDING',
    'PROVISIONING_FAILED',
    'PARTIALLY_PROVISIONED',
    'ACCOUNT_CREATED',
    'RETURNED'
];
const REQUEST_TYPE_LABELS = {
    NEW_HIRE: 'New hire',
    LEAVING_COMPANY: 'Leaving company',
    UPDATE_EMPLOYEE_INFO: 'Info update'
};
function formatDateTime(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}
function formatCompactDateTime(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(undefined, {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}
function formatWaitingDuration(iso) {
    const elapsedMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.max(0, Math.round(elapsedMs / 60000));
    if (minutes < 60) return `${Math.max(minutes, 1)}m`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.round(hours / 24);
    if (days < 7) return `${days}d`;
    return `${Math.round(days / 7)}w`;
}
/** Business days (Mon–Fri) between now and a target ISO date, ignoring time of day. */ function businessDaysUntil(iso) {
    const target = new Date(iso);
    target.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let businessDays = 0;
    const cursor = new Date(today);
    const direction = target >= today ? 1 : -1;
    while(cursor.getTime() !== target.getTime()){
        cursor.setDate(cursor.getDate() + direction);
        const day = cursor.getDay();
        if (day !== 0 && day !== 6) businessDays += direction;
    }
    return businessDays;
}
function isStartDateUrgent(startDate) {
    if (!startDate) return false;
    const businessDays = businessDaysUntil(startDate);
    return businessDays >= 0 && businessDays <= 2;
}
function compareByUrgency(a, b) {
    if (Boolean(a.activeAccessWarning) !== Boolean(b.activeAccessWarning)) {
        return a.activeAccessWarning ? -1 : 1;
    }
    if (typeof a.riskScore === 'number' && typeof b.riskScore === 'number' && a.riskScore !== b.riskScore) {
        return b.riskScore - a.riskScore;
    }
    if (Boolean(a.isSlaBreached) !== Boolean(b.isSlaBreached)) {
        return a.isSlaBreached ? -1 : 1;
    }
    const rank = (request)=>{
        if (FAILED_STATUSES.includes(request.status)) return 0;
        if (request.status === 'PENDING_REVIEW') return 1;
        if (request.status === 'APPROVED') return 2;
        return 3;
    };
    const rankDiff = rank(a) - rank(b);
    if (rankDiff !== 0) return rankDiff;
    if (a.status === 'PENDING_REVIEW' && b.status === 'PENDING_REVIEW') {
        if (a.startDate && b.startDate) {
            const startDiff = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
            if (startDiff !== 0) return startDiff;
        } else if (a.startDate !== b.startDate) {
            return a.startDate ? -1 : 1;
        }
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
    }
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/auditor-api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "batchProvisionRequests",
    ()=>batchProvisionRequests,
    "cancelRequest",
    ()=>cancelRequest,
    "escalateRequest",
    ()=>escalateRequest,
    "getMetrics",
    ()=>getMetrics,
    "getRequest",
    ()=>getRequest,
    "getSystemAuditLog",
    ()=>getSystemAuditLog,
    "getZohoLiveStatus",
    ()=>getZohoLiveStatus,
    "listEmployeeDirectory",
    ()=>listEmployeeDirectory,
    "listRequests",
    ()=>listRequests,
    "offboardEmployee",
    ()=>offboardEmployee,
    "previewAccountNotification",
    ()=>previewAccountNotification,
    "provisionRequest",
    ()=>provisionRequest,
    "quickApproveRequest",
    ()=>quickApproveRequest,
    "rejectRequest",
    ()=>rejectRequest,
    "resendAccountNotification",
    ()=>resendAccountNotification,
    "retryProvisioning",
    ()=>retryProvisioning,
    "returnRequest",
    ()=>returnRequest,
    "runDueOffboardings",
    ()=>runDueOffboardings,
    "saveResolvedAccount",
    ()=>saveResolvedAccount,
    "searchEmployees",
    ()=>searchEmployees,
    "sendAccountNotification",
    ()=>sendAccountNotification,
    "updateEmployeeSubmission",
    ()=>updateEmployeeSubmission
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-client.ts [app-client] (ecmascript)");
;
function getMetrics() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])('/auditor/metrics');
}
function getZohoLiveStatus() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])('/auditor/zoho-status');
}
function listRequests() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])('/auditor/requests');
}
function listEmployeeDirectory() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])('/auditor/employees/directory');
}
function getRequest(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}`);
}
function saveResolvedAccount(id, input) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/account`, {
        method: 'PUT',
        body: input
    });
}
function quickApproveRequest(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/quick-approve`, {
        method: 'POST'
    });
}
function escalateRequest(id, note) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/escalate`, {
        method: 'POST',
        body: {
            note
        }
    });
}
function updateEmployeeSubmission(id, input) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/submission`, {
        method: 'PUT',
        body: input
    });
}
function offboardEmployee(id, options = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/offboard`, {
        method: 'POST',
        body: options
    });
}
function runDueOffboardings(asOfIso) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])('/auditor/offboarding/run-due', {
        method: 'POST',
        body: asOfIso ? {
            asOfIso
        } : {}
    });
}
function searchEmployees(query) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/employees?query=${encodeURIComponent(query)}`);
}
function rejectRequest(id, reason) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/reject`, {
        method: 'POST',
        body: {
            reason
        }
    });
}
function returnRequest(id, reason) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/return`, {
        method: 'POST',
        body: {
            reason
        }
    });
}
function cancelRequest(id, reason) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/cancel`, {
        method: 'POST',
        body: {
            reason
        }
    });
}
function provisionRequest(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/provision`, {
        method: 'POST'
    });
}
function batchProvisionRequests(requestIds) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])('/auditor/requests/batch-provision', {
        method: 'POST',
        body: {
            requestIds
        }
    });
}
function retryProvisioning(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/retry`, {
        method: 'POST'
    });
}
function previewAccountNotification(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/notification-preview`);
}
function sendAccountNotification(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/notify`, {
        method: 'POST'
    });
}
function resendAccountNotification(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/resend-notification`, {
        method: 'POST'
    });
}
function getSystemAuditLog(params = {}) {
    const qs = new URLSearchParams();
    if (params.query) qs.set('query', params.query);
    if (params.actorType) qs.set('actorType', params.actorType);
    if (params.action) qs.set('action', params.action);
    if (params.system) qs.set('system', params.system);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/audit-log${suffix}`);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_0n6z9zr._.js.map