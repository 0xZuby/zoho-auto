module.exports = [
"[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AccountSetupCard",
    ()=>AccountSetupCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auditor-api.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function toAccountType(zoho, insideMaps) {
    if (zoho && insideMaps) return 'ZOHO_AND_INSIDEMAPS';
    return insideMaps ? 'INSIDEMAPS' : 'ZOHO';
}
function AccountSetupCard({ request, onSaved }) {
    const isLeavingCompany = request.submission.requestType === 'LEAVING_COMPANY';
    const isLocked = request.status !== 'PENDING_REVIEW' && request.status !== 'APPROVED' && request.status !== 'PROVISIONING_FAILED' && request.status !== 'PARTIALLY_PROVISIONED';
    const hasRun = request.provisioning.steps.length > 0;
    const initial = request.resolvedAccount ?? request.proposedAccount;
    const proposed = request.proposedAccount;
    const [createZoho, setCreateZoho] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initial.accountType !== 'INSIDEMAPS');
    const [addInsideMaps, setAddInsideMaps] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initial.accountType === 'INSIDEMAPS' || initial.accountType === 'ZOHO_AND_INSIDEMAPS');
    const [corporateEmail, setCorporateEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initial.corporateEmail);
    const [insideMapsRolesText, setInsideMapsRolesText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])((initial.insideMapsRoles?.length ? initial.insideMapsRoles : proposed.insideMapsRoles ?? []).join(', '));
    const [errors, setErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [isSaving, setIsSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [saveNotice, setSaveNotice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const isApproved = Boolean(request.resolvedAccount);
    const accountType = toAccountType(createZoho, addInsideMaps);
    const nothingSelected = !createZoho && !addInsideMaps;
    const canCreate = !isLocked && !hasRun && !nothingSelected;
    const fieldsLocked = isLocked || hasRun;
    // PRD section 9: highlight wherever the auditor's current values differ
    // from the rules engine's proposal.
    const emailOverridden = corporateEmail.trim() !== proposed.corporateEmail.trim();
    async function handleSave(andCreate) {
        setErrors({});
        setSaveNotice(null);
        setIsSaving(true);
        try {
            const insideMapsRoles = insideMapsRolesText.split(',').map((r)=>r.trim()).filter(Boolean);
            const updated = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveResolvedAccount"])(request.id, {
                corporateEmail,
                insideMapsRoles: addInsideMaps ? insideMapsRoles : [],
                accountType
            });
            onSaved(updated);
            if (andCreate) {
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["provisionRequest"])(request.id);
                onSaved(result.request);
                setSaveNotice(result.allStepsSucceeded ? 'Accounts created.' : 'Configuration saved, but a provisioning step failed. See Provisioning below to retry.');
            } else {
                setSaveNotice('Account configuration saved.');
            }
        } catch (error) {
            if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiError"] && error.payload.errors) {
                setErrors(error.payload.errors);
            } else {
                setErrors({
                    _form: error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiError"] ? error.message : 'Could not save the account configuration.'
                });
            }
        } finally{
            setIsSaving(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "card card-padded detail-card stack gap-16",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "row-between",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    style: {
                        fontSize: 15
                    },
                    children: "Account details"
                }, void 0, false, {
                    fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                    lineNumber: 97,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                lineNumber: 96,
                columnNumber: 7
            }, this),
            isLeavingCompany ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "card-section-intro",
                        children: "Offboarding disables both access points in one step. There is nothing to choose or approve here."
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                        lineNumber: 102,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "notice notice-info stack gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: "Work email:"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                        lineNumber: 107,
                                        columnNumber: 15
                                    }, this),
                                    " ",
                                    initial.corporateEmail || request.submission.privateEmail
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                lineNumber: 106,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Zoho Mail access is disabled and InsideMaps access is revoked, regardless of the account type this employee had."
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                lineNumber: 109,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                        lineNumber: 105,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                lineNumber: 101,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    request.proposedAccount.needsReview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "chip chip-warning",
                        style: {
                            alignSelf: 'flex-start'
                        },
                        children: "Rules engine flagged for review"
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                        lineNumber: 115,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "card-section-intro",
                        children: "Create the Zoho Mail mailbox in one click — no invitation is sent. Optionally add an InsideMaps account with roles."
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                        lineNumber: 117,
                        columnNumber: 7
                    }, this),
                    request.proposedAccount.collisionAdjusted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "notice notice-warning",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Email collision resolved:"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                lineNumber: 123,
                                columnNumber: 11
                            }, this),
                            " Base address",
                            ' ',
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                children: request.proposedAccount.baseEmail
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                lineNumber: 124,
                                columnNumber: 11
                            }, this),
                            " was already in use. Automatically adjusted to next available suffix starting at 2: ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                children: request.proposedAccount.corporateEmail
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                lineNumber: 125,
                                columnNumber: 33
                            }, this),
                            "."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                        lineNumber: 122,
                        columnNumber: 9
                    }, this),
                    request.proposedAccount.needsReview && request.proposedAccount.reasons.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "notice notice-warning",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                            style: {
                                margin: 0,
                                paddingLeft: 18
                            },
                            children: request.proposedAccount.reasons.map((reason)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: reason
                                }, reason, false, {
                                    fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                    lineNumber: 133,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                            lineNumber: 131,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                        lineNumber: 130,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "field",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "field-label",
                                htmlFor: "corporate-email",
                                children: "Corporate email"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                lineNumber: 140,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                id: "corporate-email",
                                className: `input${errors.corporateEmail ? ' has-error' : ''}`,
                                value: corporateEmail,
                                onChange: (event)=>setCorporateEmail(event.target.value),
                                disabled: fieldsLocked
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                lineNumber: 143,
                                columnNumber: 9
                            }, this),
                            errors.corporateEmail && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "field-error",
                                children: errors.corporateEmail
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                lineNumber: 150,
                                columnNumber: 35
                            }, this),
                            emailOverridden && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(OverrideNote, {
                                proposedValue: proposed.corporateEmail
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                lineNumber: 151,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                        lineNumber: 139,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "stack gap-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: `radio-option${createZoho ? ' selected' : ''}`,
                                style: {
                                    alignItems: 'flex-start'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "checkbox",
                                        checked: createZoho,
                                        onChange: (event)=>setCreateZoho(event.target.checked),
                                        disabled: fieldsLocked,
                                        style: {
                                            accentColor: 'var(--accent)',
                                            marginTop: 3
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                        lineNumber: 156,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "stack gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                style: {
                                                    fontSize: 13.5
                                                },
                                                children: "Zoho Mail account"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                                lineNumber: 164,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-faint text-sm",
                                                children: "Creates the mailbox directly. The employee receives a temporary password by email."
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                                lineNumber: 165,
                                                columnNumber: 13
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                        lineNumber: 163,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                lineNumber: 155,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: `radio-option${addInsideMaps ? ' selected' : ''}`,
                                style: {
                                    alignItems: 'flex-start'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "checkbox",
                                        checked: addInsideMaps,
                                        onChange: (event)=>setAddInsideMaps(event.target.checked),
                                        disabled: fieldsLocked,
                                        style: {
                                            accentColor: 'var(--accent)',
                                            marginTop: 3
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                        lineNumber: 172,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "stack gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                style: {
                                                    fontSize: 13.5
                                                },
                                                children: "Also create an InsideMaps account"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                                lineNumber: 180,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-faint text-sm",
                                                children: "Creates the user through the InsideMaps API, assigns the roles below and enforces 2SV."
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                                lineNumber: 181,
                                                columnNumber: 13
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                        lineNumber: 179,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                lineNumber: 171,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                        lineNumber: 154,
                        columnNumber: 7
                    }, this),
                    addInsideMaps && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "field",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "field-label",
                                htmlFor: "insidemaps-roles",
                                children: "InsideMaps roles (comma-separated)"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                lineNumber: 190,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                id: "insidemaps-roles",
                                className: `input${errors.insideMapsRoles ? ' has-error' : ''}`,
                                value: insideMapsRolesText,
                                onChange: (event)=>setInsideMapsRolesText(event.target.value),
                                placeholder: "IM_DEFAULT_USER",
                                disabled: fieldsLocked
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                lineNumber: 193,
                                columnNumber: 11
                            }, this),
                            errors.insideMapsRoles && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "field-error",
                                children: errors.insideMapsRoles
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                lineNumber: 201,
                                columnNumber: 38
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                        lineNumber: 189,
                        columnNumber: 9
                    }, this),
                    errors._form && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "notice notice-error",
                        children: errors._form
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                        lineNumber: 205,
                        columnNumber: 24
                    }, this),
                    errors.accountType && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "notice notice-error",
                        children: errors.accountType
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                        lineNumber: 206,
                        columnNumber: 30
                    }, this),
                    saveNotice && !errors._form && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "notice notice-success",
                        children: saveNotice
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                        lineNumber: 207,
                        columnNumber: 39
                    }, this),
                    isApproved && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "notice notice-info",
                        children: [
                            "Approved by an auditor on ",
                            new Date(request.resolvedAccount.resolvedAt).toLocaleString(),
                            "."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                        lineNumber: 210,
                        columnNumber: 9
                    }, this),
                    !isLocked && !hasRun && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "row",
                        style: {
                            gap: 10
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "btn btn-primary",
                                onClick: ()=>handleSave(true),
                                disabled: isSaving || nothingSelected,
                                children: isSaving ? 'Working…' : 'Create accounts'
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                lineNumber: 217,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "btn btn-secondary",
                                onClick: ()=>handleSave(false),
                                disabled: isSaving || nothingSelected,
                                children: isApproved ? 'Update configuration only' : 'Approve without creating'
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                                lineNumber: 225,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                        lineNumber: 216,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                lineNumber: 113,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
        lineNumber: 95,
        columnNumber: 5
    }, this);
}
/** Shown next to a field whose current value differs from the rules
 * engine's proposal, so the override is visible before it's saved. */ function OverrideNote({ proposedValue }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "field-hint override-note",
        children: [
            "Overrides rules engine proposal: ",
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                children: proposedValue
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
                lineNumber: 246,
                columnNumber: 40
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx",
        lineNumber: 245,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/auditor/requests/[id]/components/AuditTrailCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuditTrailCard",
    ()=>AuditTrailCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$statusPresentation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/auditor/statusPresentation.ts [app-ssr] (ecmascript)");
;
;
/** Actor tone drives the entry's marker colour — a quick visual scan of who did what. */ const ACTOR_TONE = {
    AUDITOR: 'tone-auditor',
    HR: 'tone-hr',
    EMPLOYEE: 'tone-employee',
    SYSTEM: 'tone-system'
};
function AuditTrailCard({ entries }) {
    const ordered = [
        ...entries
    ].reverse();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "card card-padded detail-card audit-card stack gap-16",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                style: {
                    fontSize: 15
                },
                children: "Audit history"
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/AuditTrailCard.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "card-section-intro",
                children: "A timestamped record of every review and provisioning action."
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/AuditTrailCard.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                className: "audit-trail",
                children: ordered.map((entry, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        className: `audit-entry ${ACTOR_TONE[entry.actorType]}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "audit-entry-detail",
                                children: entry.detail
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/AuditTrailCard.tsx",
                                lineNumber: 22,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "audit-entry-meta",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "audit-entry-actor",
                                        children: entry.actorType
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/AuditTrailCard.tsx",
                                        lineNumber: 24,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "audit-entry-time",
                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$statusPresentation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDateTime"])(entry.at)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/AuditTrailCard.tsx",
                                        lineNumber: 25,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/AuditTrailCard.tsx",
                                lineNumber: 23,
                                columnNumber: 13
                            }, this)
                        ]
                    }, `${entry.at}-${index}`, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/AuditTrailCard.tsx",
                        lineNumber: 21,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/AuditTrailCard.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/auditor/requests/[id]/components/AuditTrailCard.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/auditor/requests/[id]/components/ConfirmOffboardDialog.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConfirmOffboardDialog",
    ()=>ConfirmOffboardDialog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
'use client';
;
function ConfirmOffboardDialog({ employeeName, onCancel, onConfirm, isSubmitting }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "confirm-offboard-title",
        style: {
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 20, 25, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            zIndex: 50
        },
        onClick: (event)=>{
            if (event.target === event.currentTarget) onCancel();
        },
        onKeyDown: (event)=>{
            if (event.key === 'Escape') onCancel();
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "card card-padded stack gap-20",
            style: {
                maxWidth: 420,
                width: '100%'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    id: "confirm-offboard-title",
                    style: {
                        fontSize: 18
                    },
                    children: [
                        "Offboard ",
                        employeeName,
                        "?"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/auditor/requests/[id]/components/ConfirmOffboardDialog.tsx",
                    lineNumber: 34,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-muted text-sm",
                    children: [
                        "This immediately disables ",
                        employeeName,
                        "’s Zoho Mail account and revokes their InsideMaps access. There’s no separate review step — it takes effect as soon as you confirm."
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/auditor/requests/[id]/components/ConfirmOffboardDialog.tsx",
                    lineNumber: 37,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "row-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            className: "btn btn-ghost",
                            onClick: onCancel,
                            disabled: isSubmitting,
                            children: "Cancel"
                        }, void 0, false, {
                            fileName: "[project]/src/app/auditor/requests/[id]/components/ConfirmOffboardDialog.tsx",
                            lineNumber: 43,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            className: "btn btn-danger",
                            onClick: onConfirm,
                            disabled: isSubmitting,
                            children: isSubmitting ? 'Offboarding…' : 'Offboard'
                        }, void 0, false, {
                            fileName: "[project]/src/app/auditor/requests/[id]/components/ConfirmOffboardDialog.tsx",
                            lineNumber: 46,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/auditor/requests/[id]/components/ConfirmOffboardDialog.tsx",
                    lineNumber: 42,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/auditor/requests/[id]/components/ConfirmOffboardDialog.tsx",
            lineNumber: 33,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/auditor/requests/[id]/components/ConfirmOffboardDialog.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/auditor/requests/[id]/components/ConfirmProvisionDialog.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConfirmProvisionDialog",
    ()=>ConfirmProvisionDialog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
'use client';
;
function ConfirmProvisionDialog({ employeeName, resolvedAccount, onCancel, onConfirm, isSubmitting }) {
    const includesZoho = resolvedAccount.accountType !== 'INSIDEMAPS';
    const includesInsideMaps = resolvedAccount.accountType !== 'ZOHO';
    const title = includesZoho ? includesInsideMaps ? 'Create Zoho Mail + InsideMaps?' : 'Create Zoho Mail account?' : 'Create InsideMaps account?';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "confirm-provision-title",
        style: {
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 20, 25, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            zIndex: 50
        },
        onClick: (event)=>{
            if (event.target === event.currentTarget) onCancel();
        },
        onKeyDown: (event)=>{
            if (event.key === 'Escape') onCancel();
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "card card-padded stack gap-20",
            style: {
                maxWidth: 420,
                width: '100%'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    id: "confirm-provision-title",
                    style: {
                        fontSize: 18
                    },
                    children: title
                }, void 0, false, {
                    fileName: "[project]/src/app/auditor/requests/[id]/components/ConfirmProvisionDialog.tsx",
                    lineNumber: 45,
                    columnNumber: 9
                }, this),
                includesZoho && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-muted text-sm",
                    children: "The mailbox is created immediately (no invitation). A temporary password is emailed to the employee's private address."
                }, void 0, false, {
                    fileName: "[project]/src/app/auditor/requests/[id]/components/ConfirmProvisionDialog.tsx",
                    lineNumber: 50,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                    className: "definition-list",
                    style: {
                        gridTemplateColumns: '1fr'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                    children: "Employee"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/auditor/requests/[id]/components/ConfirmProvisionDialog.tsx",
                                    lineNumber: 58,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                    children: employeeName
                                }, void 0, false, {
                                    fileName: "[project]/src/app/auditor/requests/[id]/components/ConfirmProvisionDialog.tsx",
                                    lineNumber: 59,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/auditor/requests/[id]/components/ConfirmProvisionDialog.tsx",
                            lineNumber: 57,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                    children: "Email"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/auditor/requests/[id]/components/ConfirmProvisionDialog.tsx",
                                    lineNumber: 62,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                    children: resolvedAccount.corporateEmail
                                }, void 0, false, {
                                    fileName: "[project]/src/app/auditor/requests/[id]/components/ConfirmProvisionDialog.tsx",
                                    lineNumber: 63,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/auditor/requests/[id]/components/ConfirmProvisionDialog.tsx",
                            lineNumber: 61,
                            columnNumber: 11
                        }, this),
                        includesInsideMaps && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                    children: "InsideMaps roles"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/auditor/requests/[id]/components/ConfirmProvisionDialog.tsx",
                                    lineNumber: 67,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                    children: (resolvedAccount.insideMapsRoles ?? []).join(', ') || '—'
                                }, void 0, false, {
                                    fileName: "[project]/src/app/auditor/requests/[id]/components/ConfirmProvisionDialog.tsx",
                                    lineNumber: 68,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/auditor/requests/[id]/components/ConfirmProvisionDialog.tsx",
                            lineNumber: 66,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/auditor/requests/[id]/components/ConfirmProvisionDialog.tsx",
                    lineNumber: 56,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "row-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            className: "btn btn-ghost",
                            onClick: onCancel,
                            disabled: isSubmitting,
                            children: "Cancel"
                        }, void 0, false, {
                            fileName: "[project]/src/app/auditor/requests/[id]/components/ConfirmProvisionDialog.tsx",
                            lineNumber: 74,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            className: "btn btn-primary",
                            onClick: onConfirm,
                            disabled: isSubmitting,
                            children: isSubmitting ? 'Creating…' : 'Create'
                        }, void 0, false, {
                            fileName: "[project]/src/app/auditor/requests/[id]/components/ConfirmProvisionDialog.tsx",
                            lineNumber: 77,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/auditor/requests/[id]/components/ConfirmProvisionDialog.tsx",
                    lineNumber: 73,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/auditor/requests/[id]/components/ConfirmProvisionDialog.tsx",
            lineNumber: 44,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/auditor/requests/[id]/components/ConfirmProvisionDialog.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EmployeeInfoCard",
    ()=>EmployeeInfoCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$form$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/form-api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auditor-api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$request$2d$form$2f$components$2f$TextField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/request-form/components/TextField.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$request$2d$form$2f$components$2f$ChoiceWithOtherField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/request-form/components/ChoiceWithOtherField.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$requests$2f5b$id$5d2f$components$2f$ConfirmOffboardDialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/auditor/requests/[id]/components/ConfirmOffboardDialog.tsx [app-ssr] (ecmascript)");
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
const REQUEST_TYPE_LABELS = {
    NEW_HIRE: 'New hire',
    LEAVING_COMPANY: 'Leaving company',
    UPDATE_EMPLOYEE_INFO: 'Update employee info'
};
// Matches config/catalog.js's OTHER_VALUE sentinel. HR chose free text for
// this field instead of a catalog option, so the rules engine (PRD section
// 10) has nothing to map it to — flag it for the auditor rather than
// silently falling back to "needs review" on the account side only.
const OTHER_SENTINEL = 'Other';
function UnmappedFlag() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "chip chip-warning unmapped-flag",
        title: "HR entered a free-text value the rules engine can't map.",
        children: "Unmapped"
    }, void 0, false, {
        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
function toFormState(request) {
    const { submission } = request;
    return {
        nameAndSurname: submission.nameAndSurname,
        privateEmail: submission.privateEmail,
        country: submission.country,
        countryOther: submission.countryOther,
        department: submission.department,
        departmentOther: submission.departmentOther,
        team: submission.team,
        teamOther: submission.teamOther,
        subTeam: submission.subTeam,
        subTeamOther: submission.subTeamOther,
        jobPosition: submission.jobPosition,
        jobPositionOther: submission.jobPositionOther,
        managerEmail: submission.managerEmail,
        startDate: submission.startDate,
        githubProfile: submission.githubProfile,
        githubRepositories: submission.githubRepositories
    };
}
function renderDiffValue(oldValue, newValue) {
    const prev = (oldValue ?? '').trim();
    const next = (newValue ?? '').trim();
    if (prev && prev !== next) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "diff-value",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("del", {
                    className: "diff-old",
                    children: prev
                }, void 0, false, {
                    fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                    lineNumber: 66,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "diff-arrow",
                    "aria-hidden": true,
                    children: "→"
                }, void 0, false, {
                    fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                    lineNumber: 67,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ins", {
                    className: "diff-new",
                    children: next || '-'
                }, void 0, false, {
                    fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                    lineNumber: 68,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
            lineNumber: 65,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        children: next || '-'
    }, void 0, false, {
        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
        lineNumber: 72,
        columnNumber: 10
    }, this);
}
function EmployeeInfoCard({ request, onUpdated }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const { submission, previousSubmission } = request;
    const [catalog, setCatalog] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isEditing, setIsEditing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>toFormState(request));
    const [errors, setErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [isSaving, setIsSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [saveNotice, setSaveNotice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showOffboardConfirm, setShowOffboardConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isOffboarding, setIsOffboarding] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [offboardError, setOffboardError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isEditing && !catalog) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$form$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFormCatalog"])().then(setCatalog).catch(()=>setErrors({
                    _form: 'Could not load the option lists. Try again.'
                }));
        }
    }, [
        isEditing,
        catalog
    ]);
    function updateField(field, value) {
        setForm((current)=>({
                ...current,
                [field]: value
            }));
    }
    function startEditing() {
        setForm(toFormState(request));
        setErrors({});
        setSaveNotice(null);
        setIsEditing(true);
    }
    function cancelEditing() {
        setIsEditing(false);
        setErrors({});
    }
    async function handleSave() {
        setErrors({});
        setSaveNotice(null);
        setIsSaving(true);
        try {
            const updated = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateEmployeeSubmission"])(request.id, form);
            onUpdated(updated);
            setIsEditing(false);
            setSaveNotice('Employee information updated.');
        } catch (error) {
            if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiError"] && error.payload.errors) {
                setErrors(error.payload.errors);
            } else {
                setErrors({
                    _form: error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiError"] ? error.message : 'Could not save employee information.'
                });
            }
        } finally{
            setIsSaving(false);
        }
    }
    async function handleOffboard() {
        setIsOffboarding(true);
        setOffboardError(null);
        try {
            const offboardingRequest = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["offboardEmployee"])(request.id);
            router.push(`/auditor/requests/${offboardingRequest.id}`);
        } catch (error) {
            setOffboardError(error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiError"] ? error.message : 'Could not start offboarding for this employee.');
            setIsOffboarding(false);
            setShowOffboardConfirm(false);
        }
    }
    const isDevelopmentRequest = catalog ? isDevelopmentValue(form.department === catalog.otherValue ? form.departmentOther : form.department) : submission.isDevelopmentRequest;
    const canOffboard = submission.requestType !== 'LEAVING_COMPANY' && !request.supersededByRequestId;
    const canEdit = !request.supersededByRequestId;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "card card-padded detail-card stack gap-16",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "row-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "row",
                        style: {
                            gap: 10
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: {
                                    fontSize: 15
                                },
                                children: "Employee information"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 158,
                                columnNumber: 11
                            }, this),
                            previousSubmission && !isEditing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "chip chip-info",
                                style: {
                                    fontSize: 11,
                                    padding: '2px 8px'
                                },
                                children: "Changes highlighted"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 160,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                        lineNumber: 157,
                        columnNumber: 9
                    }, this),
                    canEdit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "row",
                        style: {
                            gap: 8
                        },
                        children: [
                            isEditing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "btn btn-primary btn-sm",
                                        onClick: handleSave,
                                        disabled: isSaving,
                                        children: isSaving ? 'Saving…' : 'Save changes'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                        lineNumber: 169,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "btn btn-secondary btn-sm",
                                        onClick: cancelEditing,
                                        disabled: isSaving,
                                        children: "Cancel"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                        lineNumber: 172,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 168,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "btn btn-secondary btn-sm",
                                onClick: startEditing,
                                children: "Edit"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 177,
                                columnNumber: 15
                            }, this),
                            canOffboard && !isEditing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "btn btn-danger btn-sm",
                                onClick: ()=>setShowOffboardConfirm(true),
                                children: "Offboard"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 182,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                        lineNumber: 166,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                lineNumber: 156,
                columnNumber: 7
            }, this),
            offboardError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "notice notice-error",
                children: offboardError
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                lineNumber: 190,
                columnNumber: 25
            }, this),
            saveNotice && !isEditing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "notice notice-success",
                children: saveNotice
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                lineNumber: 191,
                columnNumber: 36
            }, this),
            !isEditing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                className: "definition-list",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: previousSubmission && previousSubmission.nameAndSurname !== submission.nameAndSurname ? 'is-changed' : '',
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                children: "Name and Surname"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 196,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                children: renderDiffValue(previousSubmission?.nameAndSurname, submission.nameAndSurname)
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 197,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                        lineNumber: 195,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: previousSubmission && previousSubmission.requesterEmail !== submission.requesterEmail ? 'is-changed' : '',
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                children: "Requester email"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 200,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                children: renderDiffValue(previousSubmission?.requesterEmail, submission.requesterEmail)
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 201,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                        lineNumber: 199,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                children: "Request type"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 204,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                children: REQUEST_TYPE_LABELS[submission.requestType] ?? submission.requestType
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 205,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                        lineNumber: 203,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: previousSubmission && previousSubmission.privateEmail !== submission.privateEmail ? 'is-changed' : '',
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                children: "Personal email"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 208,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                children: renderDiffValue(previousSubmission?.privateEmail, submission.privateEmail)
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 209,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                        lineNumber: 207,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: previousSubmission && previousSubmission.resolvedCountry !== submission.resolvedCountry ? 'is-changed' : '',
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                children: "Country"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 212,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                children: [
                                    renderDiffValue(previousSubmission?.resolvedCountry, submission.resolvedCountry),
                                    ' ',
                                    submission.country === OTHER_SENTINEL && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(UnmappedFlag, {}, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                        lineNumber: 215,
                                        columnNumber: 57
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 213,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                        lineNumber: 211,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: previousSubmission && previousSubmission.resolvedDepartment !== submission.resolvedDepartment ? 'is-changed' : '',
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                children: "Department"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 219,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                children: [
                                    renderDiffValue(previousSubmission?.resolvedDepartment, submission.resolvedDepartment),
                                    ' ',
                                    submission.department === OTHER_SENTINEL && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(UnmappedFlag, {}, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                        lineNumber: 222,
                                        columnNumber: 60
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 220,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                        lineNumber: 218,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: previousSubmission && previousSubmission.resolvedTeam !== submission.resolvedTeam ? 'is-changed' : '',
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                children: "Team"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 226,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                children: [
                                    renderDiffValue(previousSubmission?.resolvedTeam, submission.resolvedTeam),
                                    ' ',
                                    submission.team === OTHER_SENTINEL && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(UnmappedFlag, {}, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                        lineNumber: 229,
                                        columnNumber: 54
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 227,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                        lineNumber: 225,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: previousSubmission && previousSubmission.resolvedSubTeam !== submission.resolvedSubTeam ? 'is-changed' : '',
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                children: "Sub team"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 233,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                children: [
                                    renderDiffValue(previousSubmission?.resolvedSubTeam, submission.resolvedSubTeam),
                                    ' ',
                                    submission.subTeam === OTHER_SENTINEL && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(UnmappedFlag, {}, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                        lineNumber: 236,
                                        columnNumber: 57
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 234,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                        lineNumber: 232,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: previousSubmission && previousSubmission.resolvedJobPosition !== submission.resolvedJobPosition ? 'is-changed' : '',
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                children: "Job position"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 240,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                children: [
                                    renderDiffValue(previousSubmission?.resolvedJobPosition, submission.resolvedJobPosition),
                                    ' ',
                                    submission.jobPosition === OTHER_SENTINEL && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(UnmappedFlag, {}, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                        lineNumber: 243,
                                        columnNumber: 61
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 241,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                        lineNumber: 239,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: previousSubmission && previousSubmission.managerEmail !== submission.managerEmail ? 'is-changed' : '',
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                children: "Team Lead / Manager email"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 247,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                children: renderDiffValue(previousSubmission?.managerEmail, submission.managerEmail)
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 248,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                        lineNumber: 246,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: previousSubmission && previousSubmission.startDate !== submission.startDate ? 'is-changed' : '',
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                children: "Start date"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 251,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                children: renderDiffValue(previousSubmission?.startDate, submission.startDate)
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 252,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                        lineNumber: 250,
                        columnNumber: 11
                    }, this),
                    submission.isDevelopmentRequest && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: previousSubmission && previousSubmission.githubProfile !== submission.githubProfile ? 'is-changed' : '',
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        children: "GitHub profile"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                        lineNumber: 257,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        children: renderDiffValue(previousSubmission?.githubProfile, submission.githubProfile)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                        lineNumber: 258,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 256,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `span-2${previousSubmission && previousSubmission.githubRepositories !== submission.githubRepositories ? ' is-changed' : ''}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        children: "GitHub repositories"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                        lineNumber: 261,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        style: {
                                            whiteSpace: 'pre-wrap'
                                        },
                                        children: renderDiffValue(previousSubmission?.githubRepositories, submission.githubRepositories)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                        lineNumber: 262,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 260,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                        lineNumber: 255,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                lineNumber: 194,
                columnNumber: 9
            }, this),
            isEditing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "stack gap-16",
                children: [
                    !catalog && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "skeleton",
                        style: {
                            height: 220,
                            borderRadius: 12
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                        lineNumber: 273,
                        columnNumber: 24
                    }, this),
                    catalog && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "form-grid",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$request$2d$form$2f$components$2f$TextField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TextField"], {
                                        label: "Name and Surname",
                                        required: true,
                                        value: form.nameAndSurname,
                                        error: errors.nameAndSurname,
                                        className: "span-2",
                                        onChange: (value)=>updateField('nameAndSurname', value)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                        lineNumber: 278,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$request$2d$form$2f$components$2f$TextField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TextField"], {
                                        label: "Personal email",
                                        required: true,
                                        type: "email",
                                        value: form.privateEmail,
                                        error: errors.privateEmail,
                                        onChange: (value)=>updateField('privateEmail', value)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                        lineNumber: 286,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$request$2d$form$2f$components$2f$TextField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TextField"], {
                                        label: "Team Lead / Manager email",
                                        required: true,
                                        type: "email",
                                        value: form.managerEmail,
                                        error: errors.managerEmail,
                                        onChange: (value)=>updateField('managerEmail', value)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                        lineNumber: 294,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$request$2d$form$2f$components$2f$TextField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TextField"], {
                                        label: "Start date",
                                        type: "date",
                                        value: form.startDate,
                                        error: errors.startDate,
                                        onChange: (value)=>updateField('startDate', value)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                        lineNumber: 302,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$request$2d$form$2f$components$2f$ChoiceWithOtherField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ChoiceWithOtherField"], {
                                        label: "Country",
                                        options: catalog.countries,
                                        otherSentinel: catalog.otherValue,
                                        value: form.country,
                                        otherValue: form.countryOther,
                                        error: errors.country,
                                        otherError: errors.countryOther,
                                        onChange: (value)=>updateField('country', value),
                                        onOtherChange: (value)=>updateField('countryOther', value)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                        lineNumber: 309,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$request$2d$form$2f$components$2f$ChoiceWithOtherField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ChoiceWithOtherField"], {
                                        label: "Department",
                                        options: catalog.departments,
                                        otherSentinel: catalog.otherValue,
                                        value: form.department,
                                        otherValue: form.departmentOther,
                                        error: errors.department,
                                        otherError: errors.departmentOther,
                                        onChange: (value)=>updateField('department', value),
                                        onOtherChange: (value)=>updateField('departmentOther', value)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                        lineNumber: 320,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$request$2d$form$2f$components$2f$ChoiceWithOtherField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ChoiceWithOtherField"], {
                                        label: "Team",
                                        options: catalog.teams,
                                        otherSentinel: catalog.otherValue,
                                        value: form.team,
                                        otherValue: form.teamOther,
                                        error: errors.team,
                                        otherError: errors.teamOther,
                                        onChange: (value)=>updateField('team', value),
                                        onOtherChange: (value)=>updateField('teamOther', value)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                        lineNumber: 331,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$request$2d$form$2f$components$2f$ChoiceWithOtherField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ChoiceWithOtherField"], {
                                        label: "Sub team",
                                        options: catalog.subTeams,
                                        otherSentinel: catalog.otherValue,
                                        value: form.subTeam,
                                        otherValue: form.subTeamOther,
                                        error: errors.subTeam,
                                        otherError: errors.subTeamOther,
                                        onChange: (value)=>updateField('subTeam', value),
                                        onOtherChange: (value)=>updateField('subTeamOther', value)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                        lineNumber: 342,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$request$2d$form$2f$components$2f$ChoiceWithOtherField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ChoiceWithOtherField"], {
                                        label: "Job position",
                                        options: catalog.jobPositions,
                                        otherSentinel: catalog.otherValue,
                                        value: form.jobPosition,
                                        otherValue: form.jobPositionOther,
                                        error: errors.jobPosition,
                                        otherError: errors.jobPositionOther,
                                        onChange: (value)=>updateField('jobPosition', value),
                                        onOtherChange: (value)=>updateField('jobPositionOther', value)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                        lineNumber: 353,
                                        columnNumber: 17
                                    }, this),
                                    isDevelopmentRequest && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$request$2d$form$2f$components$2f$TextField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TextField"], {
                                                label: "GitHub profile",
                                                required: true,
                                                value: form.githubProfile,
                                                error: errors.githubProfile,
                                                onChange: (value)=>updateField('githubProfile', value)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                                lineNumber: 367,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$request$2d$form$2f$components$2f$TextField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TextField"], {
                                                label: "GitHub repositories",
                                                required: true,
                                                value: form.githubRepositories,
                                                error: errors.githubRepositories,
                                                className: "span-2",
                                                onChange: (value)=>updateField('githubRepositories', value)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                                lineNumber: 374,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                        lineNumber: 366,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 277,
                                columnNumber: 15
                            }, this),
                            errors._form && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "notice notice-error",
                                children: errors._form
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 386,
                                columnNumber: 32
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "row",
                                style: {
                                    gap: 8
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "btn btn-primary",
                                        onClick: handleSave,
                                        disabled: isSaving,
                                        children: isSaving ? 'Saving…' : 'Save changes'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                        lineNumber: 389,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "btn btn-ghost",
                                        onClick: cancelEditing,
                                        disabled: isSaving,
                                        children: "Cancel"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                        lineNumber: 392,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                                lineNumber: 388,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                        lineNumber: 276,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                lineNumber: 272,
                columnNumber: 9
            }, this),
            showOffboardConfirm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$requests$2f5b$id$5d2f$components$2f$ConfirmOffboardDialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConfirmOffboardDialog"], {
                employeeName: submission.nameAndSurname,
                isSubmitting: isOffboarding,
                onCancel: ()=>setShowOffboardConfirm(false),
                onConfirm: handleOffboard
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
                lineNumber: 402,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx",
        lineNumber: 155,
        columnNumber: 5
    }, this);
}
function isDevelopmentValue(value) {
    return [
        '3d',
        'development',
        'developement'
    ].includes(value.trim().toLowerCase());
}
}),
"[project]/src/app/auditor/requests/[id]/components/NotificationCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NotificationCard",
    ()=>NotificationCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auditor-api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$statusPresentation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/auditor/statusPresentation.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function NotificationCard({ request, onUpdated }) {
    const [isSubmitting, setIsSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [preview, setPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoadingPreview, setIsLoadingPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const canSend = request.status === 'ACCOUNT_CREATED';
    const canResend = request.status === 'COMPLETED' && request.notification.sent;
    if (!canSend && !canResend) return null;
    async function handlePreview() {
        if (preview) {
            setPreview(null);
            return;
        }
        setIsLoadingPreview(true);
        setError(null);
        try {
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["previewAccountNotification"])(request.id);
            setPreview(data);
        } catch (err) {
            setError(err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiError"] ? err.message : 'Could not load setup invitation preview.');
        } finally{
            setIsLoadingPreview(false);
        }
    }
    async function handleSend(isResend) {
        setIsSubmitting(true);
        setError(null);
        try {
            const updated = isResend ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resendAccountNotification"])(request.id) : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sendAccountNotification"])(request.id);
            onUpdated(updated);
        } catch (submitError) {
            setError(submitError instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiError"] ? submitError.message : 'Could not send the account notification.');
        } finally{
            setIsSubmitting(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "card card-padded detail-card stack gap-16",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "row-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        style: {
                            fontSize: 15
                        },
                        children: "Account setup invitation"
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/NotificationCard.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: "btn btn-secondary btn-sm",
                        onClick: handlePreview,
                        disabled: isLoadingPreview,
                        children: isLoadingPreview ? 'Loading…' : preview ? 'Hide preview' : 'Preview email'
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/NotificationCard.tsx",
                        lineNumber: 64,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/NotificationCard.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "card-section-intro",
                children: "Sends setup instructions, first-login password change requirement, and 2-Step Verification (2SV) enrollment steps to the employee’s private email."
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/NotificationCard.tsx",
                lineNumber: 68,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "notice notice-error",
                children: error
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/NotificationCard.tsx",
                lineNumber: 73,
                columnNumber: 17
            }, this),
            preview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card card-padded stack gap-8",
                style: {
                    background: '#fbfaf9'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "row-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                className: "text-sm",
                                children: preview.subject
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/NotificationCard.tsx",
                                lineNumber: 78,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-muted",
                                children: [
                                    "To: ",
                                    preview.recipient
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/NotificationCard.tsx",
                                lineNumber: 79,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/NotificationCard.tsx",
                        lineNumber: 77,
                        columnNumber: 11
                    }, this),
                    preview.managerEmail && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs text-muted",
                        children: [
                            "Manager operational alert: ",
                            preview.managerEmail
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/NotificationCard.tsx",
                        lineNumber: 82,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                        style: {
                            whiteSpace: 'pre-wrap',
                            fontSize: 12,
                            margin: 0
                        },
                        children: preview.text
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/NotificationCard.tsx",
                        lineNumber: 84,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/NotificationCard.tsx",
                lineNumber: 76,
                columnNumber: 9
            }, this),
            request.notification.sent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                className: "definition-list",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                children: "Recipient"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/NotificationCard.tsx",
                                lineNumber: 91,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                children: request.notification.recipient
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/NotificationCard.tsx",
                                lineNumber: 92,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/NotificationCard.tsx",
                        lineNumber: 90,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                children: "Last sent"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/NotificationCard.tsx",
                                lineNumber: 95,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$statusPresentation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDateTime"])(request.notification.sentAt)
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/NotificationCard.tsx",
                                lineNumber: 96,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/NotificationCard.tsx",
                        lineNumber: 94,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/NotificationCard.tsx",
                lineNumber: 89,
                columnNumber: 9
            }, this),
            canSend && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                className: "btn btn-primary",
                style: {
                    alignSelf: 'flex-start'
                },
                onClick: ()=>handleSend(false),
                disabled: isSubmitting,
                children: isSubmitting ? 'Sending…' : 'Send setup invitation'
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/NotificationCard.tsx",
                lineNumber: 102,
                columnNumber: 9
            }, this),
            canResend && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                className: "btn btn-secondary",
                style: {
                    alignSelf: 'flex-start'
                },
                onClick: ()=>handleSend(true),
                disabled: isSubmitting,
                children: isSubmitting ? 'Sending…' : 'Resend setup invitation'
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/NotificationCard.tsx",
                lineNumber: 108,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/auditor/requests/[id]/components/NotificationCard.tsx",
        lineNumber: 61,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProvisioningCard",
    ()=>ProvisioningCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auditor-api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$requests$2f5b$id$5d2f$components$2f$ConfirmProvisionDialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/auditor/requests/[id]/components/ConfirmProvisionDialog.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
const STEP_LABEL_FALLBACK = {
    validate_employee: 'Employee & approved configuration validated',
    check_email_availability: 'Email availability checked',
    create_user: 'Zoho Mail account created',
    create_im_user: 'InsideMaps account created via API',
    assign_im_roles: 'InsideMaps roles assigned via API',
    enforce_security_policy: '2SV & first-login password change policy enforced',
    verify_configuration: 'Account configuration verified',
    deactivate_user: 'Zoho account deactivated & sessions revoked',
    remove_im_roles: 'InsideMaps roles removed via API',
    delete_im_user: 'InsideMaps account deleted via API',
    request_insidemaps_access: 'InsideMaps account requested (employee signup pending)',
    revoke_insidemaps_access: 'InsideMaps account access revoked'
};
function ProvisioningCard({ request, onUpdated }) {
    const [showConfirm, setShowConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isSubmitting, setIsSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const accountType = request.resolvedAccount?.accountType;
    const isInsideMaps = accountType === 'INSIDEMAPS';
    const isLeavingCompany = request.submission.requestType === 'LEAVING_COMPANY';
    const canCreate = (request.status === 'APPROVED' || request.status === 'SCHEDULED_OFFBOARDING') && Boolean(request.resolvedAccount);
    const canRetry = request.status === 'PARTIALLY_PROVISIONED' || request.status === 'PROVISIONING_FAILED';
    const hasRun = request.provisioning.steps.length > 0;
    const createLabel = isLeavingCompany ? 'Disable access now' : isInsideMaps ? 'Create InsideMaps account' : accountType === 'ZOHO_AND_INSIDEMAPS' ? 'Create Zoho Mail + InsideMaps' : 'Create Zoho Mail';
    async function handleProvision() {
        setIsSubmitting(true);
        setError(null);
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["provisionRequest"])(request.id);
            onUpdated(result.request);
            setShowConfirm(false);
        } catch (submitError) {
            setError(submitError instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiError"] ? submitError.message : 'Provisioning failed to start.');
        } finally{
            setIsSubmitting(false);
        }
    }
    async function handleRetry() {
        setIsSubmitting(true);
        setError(null);
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["retryProvisioning"])(request.id);
            onUpdated(result.request);
        } catch (submitError) {
            setError(submitError instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiError"] ? submitError.message : 'Retry failed to start.');
        } finally{
            setIsSubmitting(false);
        }
    }
    if (!hasRun && !canCreate) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "card card-padded detail-card stack gap-16",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "row-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        style: {
                            fontSize: 15
                        },
                        children: "Provisioning"
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this),
                    canCreate && !hasRun && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: "btn btn-primary",
                        onClick: ()=>setShowConfirm(true),
                        children: createLabel
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx",
                        lineNumber: 85,
                        columnNumber: 11
                    }, this),
                    canRetry && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: "btn btn-secondary",
                        onClick: handleRetry,
                        disabled: isSubmitting,
                        children: isSubmitting ? 'Retrying…' : 'Retry'
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx",
                        lineNumber: 90,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "card-section-intro",
                children: isLeavingCompany ? 'Offboarding disables Zoho Mail, revokes active sessions/tokens, and removes/deletes InsideMaps access via API.' : isInsideMaps ? 'Calls InsideMaps APIs to create the user, assign roles, and enforce 2SV & first-login password change.' : accountType === 'ZOHO_AND_INSIDEMAPS' ? 'Creates the Zoho Mailbox directly, then the InsideMaps user with roles and 2SV. Failed steps can be retried.' : 'Creates the Zoho Mail mailbox directly (no invitation). Failed steps can be retried idempotently.'
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx",
                lineNumber: 95,
                columnNumber: 7
            }, this),
            request.status === 'SCHEDULED_OFFBOARDING' && request.offboardingSchedule && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "notice notice-info",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "Scheduled offboarding:"
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx",
                        lineNumber: 107,
                        columnNumber: 11
                    }, this),
                    " Access is scheduled to be blocked on",
                    ' ',
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: request.offboardingSchedule.effectiveDate
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx",
                        lineNumber: 108,
                        columnNumber: 11
                    }, this),
                    " (",
                    request.offboardingSchedule.timezone,
                    "). You can also click “Disable access now” above to execute immediately."
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx",
                lineNumber: 106,
                columnNumber: 9
            }, this),
            request.provisioning.securityPolicy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "notice notice-success",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "Security policy enforced:"
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx",
                        lineNumber: 115,
                        columnNumber: 11
                    }, this),
                    " 2-Step Verification (2SV) required:",
                    ' ',
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                        children: request.provisioning.securityPolicy.twoStepVerificationRequired ? 'Yes' : 'No'
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx",
                        lineNumber: 116,
                        columnNumber: 11
                    }, this),
                    " · Force password change on first login:",
                    ' ',
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                        children: request.provisioning.securityPolicy.forcePasswordChangeOnFirstLogin ? 'Yes' : 'No'
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx",
                        lineNumber: 118,
                        columnNumber: 11
                    }, this),
                    " · 2SV enrollment:",
                    ' ',
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                        children: request.provisioning.securityPolicy.twoStepVerificationEnrolled ? 'Enrolled' : 'Pending first login'
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx",
                        lineNumber: 120,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx",
                lineNumber: 114,
                columnNumber: 9
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "notice notice-error",
                children: error
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx",
                lineNumber: 126,
                columnNumber: 17
            }, this),
            request.provisioning.failureReason && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "notice notice-error",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: [
                            "Failure (",
                            request.provisioning.failureSystem || 'INTEGRATION',
                            " ·",
                            ' ',
                            request.provisioning.failureStep || 'step',
                            "):"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx",
                        lineNumber: 130,
                        columnNumber: 11
                    }, this),
                    ' ',
                    request.provisioning.failureReason
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx",
                lineNumber: 129,
                columnNumber: 9
            }, this),
            hasRun && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "stack gap-8",
                style: {
                    listStyle: 'none',
                    padding: 0,
                    margin: 0
                },
                children: request.provisioning.steps.map((step)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StepRow, {
                        step: step
                    }, step.name, false, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx",
                        lineNumber: 141,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx",
                lineNumber: 139,
                columnNumber: 9
            }, this),
            showConfirm && request.resolvedAccount && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$requests$2f5b$id$5d2f$components$2f$ConfirmProvisionDialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConfirmProvisionDialog"], {
                employeeName: request.submission.nameAndSurname,
                resolvedAccount: request.resolvedAccount,
                isSubmitting: isSubmitting,
                onCancel: ()=>setShowConfirm(false),
                onConfirm: handleProvision
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx",
                lineNumber: 147,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx",
        lineNumber: 81,
        columnNumber: 5
    }, this);
}
function StepRow({ step }) {
    const isSuccess = step.outcome === 'SUCCESS';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
        className: "row",
        style: {
            gap: 10
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                "aria-hidden": true,
                style: {
                    color: isSuccess ? 'var(--accent-strong)' : 'var(--danger)',
                    fontWeight: 700
                },
                children: isSuccess ? '✓' : '✗'
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx",
                lineNumber: 163,
                columnNumber: 7
            }, this),
            step.system && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "chip chip-neutral",
                style: {
                    fontSize: 11,
                    padding: '1px 6px'
                },
                children: step.system
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx",
                lineNumber: 167,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-sm",
                children: step.label ?? STEP_LABEL_FALLBACK[step.name] ?? step.name
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx",
                lineNumber: 171,
                columnNumber: 7
            }, this),
            !isSuccess && step.error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-faint text-sm",
                children: [
                    "- ",
                    step.error
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx",
                lineNumber: 172,
                columnNumber: 36
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx",
        lineNumber: 162,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/auditor/requests/[id]/components/RequestHeader.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RequestHeader",
    ()=>RequestHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auditor-api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$statusPresentation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/auditor/statusPresentation.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
const REQUEST_TYPE_EYEBROW = {
    NEW_HIRE: 'Onboarding request',
    LEAVING_COMPANY: 'Offboarding request',
    UPDATE_EMPLOYEE_INFO: 'Update request'
};
function RequestHeader({ request, onUpdated }) {
    const presentation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$statusPresentation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStatusPresentation"])(request.status);
    const canActOnRequest = request.status === 'PENDING_REVIEW' || request.status === 'APPROVED';
    const [pendingAction, setPendingAction] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    async function handleReject() {
        const reason = window.prompt('Reason for rejecting this request (optional):') ?? undefined;
        setPendingAction('reject');
        setError(null);
        try {
            const updated = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rejectRequest"])(request.id, reason);
            onUpdated(updated);
        } catch (submitError) {
            setError(submitError instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiError"] ? submitError.message : 'Could not reject the request.');
        } finally{
            setPendingAction(null);
        }
    }
    async function handleReturn() {
        const reason = window.prompt('Reason for returning this request to HR (required):');
        if (reason === null) return;
        if (!reason.trim()) {
            setError('A reason is required to return a request to HR.');
            return;
        }
        setPendingAction('return');
        setError(null);
        try {
            const updated = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["returnRequest"])(request.id, reason.trim());
            onUpdated(updated);
        } catch (submitError) {
            setError(submitError instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiError"] ? submitError.message : 'Could not return the request to HR.');
        } finally{
            setPendingAction(null);
        }
    }
    async function handleCancel() {
        if (!window.confirm('Cancel this request? This withdraws it before any account is created.')) return;
        const reason = window.prompt('Reason for cancelling this request (optional):') ?? undefined;
        setPendingAction('cancel');
        setError(null);
        try {
            const updated = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cancelRequest"])(request.id, reason);
            onUpdated(updated);
        } catch (submitError) {
            setError(submitError instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiError"] ? submitError.message : 'Could not cancel the request.');
        } finally{
            setPendingAction(null);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "stack gap-8",
        style: {
            marginBottom: 20
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "request-hero",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "stack gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-faint",
                                style: {
                                    fontSize: 12,
                                    fontWeight: 700
                                },
                                children: REQUEST_TYPE_EYEBROW[request.submission.requestType] ?? 'Request review'
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/RequestHeader.tsx",
                                lineNumber: 80,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                style: {
                                    fontSize: 26,
                                    letterSpacing: '-0.05em'
                                },
                                children: request.submission.nameAndSurname
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/RequestHeader.tsx",
                                lineNumber: 83,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-faint text-sm",
                                style: {
                                    fontFamily: 'monospace'
                                },
                                children: request.requestCode
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/RequestHeader.tsx",
                                lineNumber: 84,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/RequestHeader.tsx",
                        lineNumber: 79,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "request-hero-actions",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `chip ${presentation.chipClassName}`,
                                children: presentation.label
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/RequestHeader.tsx",
                                lineNumber: 89,
                                columnNumber: 11
                            }, this),
                            canActOnRequest && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "btn btn-secondary btn-sm",
                                        onClick: handleReturn,
                                        disabled: pendingAction !== null,
                                        children: pendingAction === 'return' ? 'Returning…' : 'Return to HR'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/RequestHeader.tsx",
                                        lineNumber: 92,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "btn btn-secondary btn-sm",
                                        onClick: handleCancel,
                                        disabled: pendingAction !== null,
                                        children: pendingAction === 'cancel' ? 'Cancelling…' : 'Cancel request'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/RequestHeader.tsx",
                                        lineNumber: 100,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "btn btn-danger btn-sm",
                                        onClick: handleReject,
                                        disabled: pendingAction !== null,
                                        children: pendingAction === 'reject' ? 'Rejecting…' : 'Reject request'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auditor/requests/[id]/components/RequestHeader.tsx",
                                        lineNumber: 108,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auditor/requests/[id]/components/RequestHeader.tsx",
                                lineNumber: 91,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/RequestHeader.tsx",
                        lineNumber: 88,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/RequestHeader.tsx",
                lineNumber: 78,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "notice notice-error",
                children: error
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/RequestHeader.tsx",
                lineNumber: 120,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/auditor/requests/[id]/components/RequestHeader.tsx",
        lineNumber: 77,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/auditor/requests/[id]/components/RequestStepTracker.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RequestStepTracker",
    ()=>RequestStepTracker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
const CLOSED_STATUSES = new Set([
    'REJECTED',
    'RETURNED',
    'CANCELLED'
]);
/**
 * 6-stage lifecycle progression:
 * Submitted → Validated → Approved → Zoho → InsideMaps → Verified
 */ function buildSteps(request) {
    const { status, submission, proposedAccount, resolvedAccount, provisioning } = request;
    const steps = provisioning?.steps ?? [];
    const hasStep = (names, outcome)=>steps.some((s)=>names.includes(s.name) && (!outcome || s.outcome === outcome));
    const isCompleted = status === 'COMPLETED' || status === 'ACCESS_REVOKED' || status === 'NOTIFICATION_SENT' || status === 'ACCOUNT_CREATED';
    const accountType = resolvedAccount?.accountType ?? proposedAccount?.accountType ?? 'ZOHO';
    const hasImRoles = (resolvedAccount?.insideMapsRoles ?? proposedAccount?.insideMapsRoles ?? []).length > 0;
    // 1. Submitted
    const submittedState = 'done';
    // 2. Validated
    let validatedState = 'done';
    if (CLOSED_STATUSES.has(status)) {
        validatedState = 'attention';
    } else if (proposedAccount?.needsReview && !resolvedAccount) {
        validatedState = 'attention';
    }
    // 3. Approved
    let approvedState = 'upcoming';
    if (resolvedAccount || isCompleted || status === 'SCHEDULED_OFFBOARDING') {
        approvedState = 'done';
    } else if (status === 'PENDING_REVIEW') {
        approvedState = validatedState === 'attention' ? 'attention' : 'current';
    }
    // 4. Zoho
    const zohoStepNames = [
        'create_user',
        'update_user',
        'enable_mail',
        'assign_groups',
        'deactivate_user'
    ];
    let zohoState = 'upcoming';
    if (accountType === 'INSIDEMAPS' && submission.requestType !== 'LEAVING_COMPANY') {
        zohoState = approvedState === 'done' ? 'done' : 'upcoming';
    } else if (hasStep(zohoStepNames, 'FAILED') || provisioning?.failureSystem === 'ZOHO') {
        zohoState = 'attention';
    } else if (hasStep([
        'create_user',
        'update_user',
        'deactivate_user'
    ], 'SUCCESS') || isCompleted) {
        zohoState = 'done';
    } else if (status === 'APPROVED' || status === 'PROVISIONING' || status === 'SCHEDULED_OFFBOARDING') {
        zohoState = 'current';
    }
    // 5. InsideMaps
    const imStepNames = [
        'create_im_user',
        'assign_im_roles',
        'remove_im_roles',
        'delete_im_user'
    ];
    let insideMapsState = 'upcoming';
    if (accountType === 'ZOHO' && submission.requestType !== 'LEAVING_COMPANY' && !hasImRoles && !hasStep(imStepNames)) {
        insideMapsState = zohoState === 'done' || isCompleted ? 'done' : 'upcoming';
    } else if (hasStep(imStepNames, 'FAILED') || provisioning?.failureSystem === 'INSIDEMAPS') {
        insideMapsState = 'attention';
    } else if (hasStep(imStepNames, 'SUCCESS') || isCompleted) {
        insideMapsState = 'done';
    } else if (zohoState === 'done' || accountType === 'INSIDEMAPS' && approvedState === 'done') {
        insideMapsState = 'current';
    }
    // 6. Verified
    const verifyStepNames = [
        'verify_configuration',
        'enforce_security_policy'
    ];
    let verifiedState = 'upcoming';
    if (hasStep(verifyStepNames, 'FAILED')) {
        verifiedState = 'attention';
    } else if (status === 'COMPLETED' || status === 'ACCESS_REVOKED' || status === 'NOTIFICATION_SENT' || hasStep([
        'verify_configuration'
    ], 'SUCCESS')) {
        verifiedState = 'done';
    } else if (status === 'ACCOUNT_CREATED') {
        verifiedState = 'current';
    }
    return [
        {
            label: 'Submitted',
            state: submittedState
        },
        {
            label: 'Validated',
            state: validatedState
        },
        {
            label: 'Approved',
            state: approvedState
        },
        {
            label: 'Zoho',
            state: zohoState
        },
        {
            label: 'InsideMaps',
            state: insideMapsState
        },
        {
            label: 'Verified',
            state: verifiedState
        }
    ];
}
function RequestStepTracker({ request }) {
    const steps = buildSteps(request);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
        className: "step-tracker",
        "aria-label": "Request progress",
        children: steps.map((step, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                className: `step-tracker-item step-${step.state}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "step-tracker-marker",
                        "aria-hidden": true,
                        children: step.state === 'done' ? '✓' : step.state === 'attention' ? '!' : index + 1
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/RequestStepTracker.tsx",
                        lineNumber: 109,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "step-tracker-label",
                        children: step.label
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/requests/[id]/components/RequestStepTracker.tsx",
                        lineNumber: 112,
                        columnNumber: 11
                    }, this)
                ]
            }, step.label, true, {
                fileName: "[project]/src/app/auditor/requests/[id]/components/RequestStepTracker.tsx",
                lineNumber: 108,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/app/auditor/requests/[id]/components/RequestStepTracker.tsx",
        lineNumber: 106,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/auditor/requests/[id]/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RequestDetailPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auditor-api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$AuditorUserContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/auditor/AuditorUserContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$requests$2f5b$id$5d2f$components$2f$RequestHeader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/auditor/requests/[id]/components/RequestHeader.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$requests$2f5b$id$5d2f$components$2f$RequestStepTracker$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/auditor/requests/[id]/components/RequestStepTracker.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$requests$2f5b$id$5d2f$components$2f$EmployeeInfoCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/auditor/requests/[id]/components/EmployeeInfoCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$requests$2f5b$id$5d2f$components$2f$AccountSetupCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/auditor/requests/[id]/components/AccountSetupCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$requests$2f5b$id$5d2f$components$2f$ProvisioningCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/auditor/requests/[id]/components/ProvisioningCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$requests$2f5b$id$5d2f$components$2f$NotificationCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/auditor/requests/[id]/components/NotificationCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$requests$2f5b$id$5d2f$components$2f$AuditTrailCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/auditor/requests/[id]/components/AuditTrailCard.tsx [app-ssr] (ecmascript)");
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
;
;
;
;
function getSectionLink(request) {
    const isOnboarded = request.status === 'COMPLETED' || request.status === 'NOTIFICATION_SENT' || request.status === 'ACCOUNT_CREATED';
    if (request.submission.requestType === 'LEAVING_COMPANY') {
        return {
            href: '/auditor/employees/offboarding',
            label: 'Offboarding'
        };
    }
    if (request.submission.requestType === 'NEW_HIRE' && !isOnboarded) {
        return {
            href: '/auditor/employees/onboarding',
            label: 'Onboarding'
        };
    }
    return {
        href: '/auditor/employees/all',
        label: 'All employees'
    };
}
function RequestDetailPage() {
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useParams"])();
    const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$AuditorUserContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuditorUser"])();
    const { setActiveNavHref } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$AuditorUserContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuditorNav"])();
    const [request, setRequest] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loadError, setLoadError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [zohoLive, setZohoLive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getZohoLiveStatus"])().then((result)=>setZohoLive(result.live)).catch(()=>setZohoLive(null));
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let isMounted = true;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auditor$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRequest"])(params.id).then((result)=>{
            if (isMounted) setRequest(result);
        }).catch(()=>{
            if (isMounted) setLoadError('Could not load this request. It may not exist or you may need to sign in again.');
        });
        return ()=>{
            isMounted = false;
        };
    }, [
        params.id
    ]);
    const backLink = request ? getSectionLink(request) : null;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setActiveNavHref(backLink ? backLink.href : null);
        return ()=>setActiveNavHref(null);
    }, [
        backLink,
        setActiveNavHref
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "ops-main",
        children: [
            loadError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "notice notice-error",
                children: loadError
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/requests/[id]/page.tsx",
                lineNumber: 71,
                columnNumber: 21
            }, this),
            !request && !loadError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "skeleton",
                style: {
                    height: 420
                }
            }, void 0, false, {
                fileName: "[project]/src/app/auditor/requests/[id]/page.tsx",
                lineNumber: 73,
                columnNumber: 34
            }, this),
            request && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    backLink && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: backLink.href,
                        className: "ops-back-link",
                        children: [
                            "← Back to ",
                            backLink.label
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/page.tsx",
                        lineNumber: 78,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$requests$2f5b$id$5d2f$components$2f$RequestHeader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RequestHeader"], {
                        request: request,
                        onUpdated: setRequest
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/requests/[id]/page.tsx",
                        lineNumber: 82,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$requests$2f5b$id$5d2f$components$2f$RequestStepTracker$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RequestStepTracker"], {
                        request: request
                    }, void 0, false, {
                        fileName: "[project]/src/app/auditor/requests/[id]/page.tsx",
                        lineNumber: 83,
                        columnNumber: 11
                    }, this),
                    zohoLive === false && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "notice notice-error",
                        style: {
                            marginBottom: 20
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Zoho is not connected."
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/page.tsx",
                                lineNumber: 86,
                                columnNumber: 15
                            }, this),
                            " The app is running in simulated mode, so no real mailbox is created.",
                            ' ',
                            user.role === 'ADMINISTRATOR' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/auditor/integrations/zoho",
                                children: "Connect Zoho Mail"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/page.tsx",
                                lineNumber: 88,
                                columnNumber: 17
                            }, this) : 'Ask an administrator to connect the Zoho organization account.'
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/page.tsx",
                        lineNumber: 85,
                        columnNumber: 13
                    }, this),
                    request.supersededByRequestId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "notice",
                        style: {
                            marginBottom: 20
                        },
                        children: [
                            "This employee’s record continues in",
                            ' ',
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: `/auditor/requests/${request.supersededByRequestId}`,
                                children: request.supersededByRequestCode
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/page.tsx",
                                lineNumber: 97,
                                columnNumber: 15
                            }, this),
                            ". This request is kept for history and no longer editable here."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/page.tsx",
                        lineNumber: 95,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "request-flow-stack",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$requests$2f5b$id$5d2f$components$2f$EmployeeInfoCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EmployeeInfoCard"], {
                                request: request,
                                onUpdated: setRequest
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/page.tsx",
                                lineNumber: 102,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$requests$2f5b$id$5d2f$components$2f$AccountSetupCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AccountSetupCard"], {
                                request: request,
                                onSaved: setRequest
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/page.tsx",
                                lineNumber: 103,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$requests$2f5b$id$5d2f$components$2f$ProvisioningCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProvisioningCard"], {
                                request: request,
                                onUpdated: setRequest
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/page.tsx",
                                lineNumber: 104,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$requests$2f5b$id$5d2f$components$2f$NotificationCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NotificationCard"], {
                                request: request,
                                onUpdated: setRequest
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/page.tsx",
                                lineNumber: 105,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$auditor$2f$requests$2f5b$id$5d2f$components$2f$AuditTrailCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AuditTrailCard"], {
                                entries: request.auditTrail
                            }, void 0, false, {
                                fileName: "[project]/src/app/auditor/requests/[id]/page.tsx",
                                lineNumber: 106,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auditor/requests/[id]/page.tsx",
                        lineNumber: 101,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/auditor/requests/[id]/page.tsx",
                lineNumber: 76,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/auditor/requests/[id]/page.tsx",
        lineNumber: 70,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/auditor/statusPresentation.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/src/app/request-form/components/ChoiceWithOtherField.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChoiceWithOtherField",
    ()=>ChoiceWithOtherField
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
'use client';
;
function ChoiceWithOtherField({ label, required = true, options, otherSentinel, value, otherValue, error, otherError, onChange, onOtherChange }) {
    const isOther = value === otherSentinel;
    const fieldId = `field-${label.replace(/\s+/g, '-').toLowerCase()}`;
    const messageId = `${fieldId}-message`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "field",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "field-label",
                htmlFor: fieldId,
                children: [
                    label,
                    required && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "required",
                        children: "*"
                    }, void 0, false, {
                        fileName: "[project]/src/app/request-form/components/ChoiceWithOtherField.tsx",
                        lineNumber: 41,
                        columnNumber: 22
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/request-form/components/ChoiceWithOtherField.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                id: fieldId,
                className: `select${error ? ' has-error' : ''}`,
                value: value,
                onChange: (event)=>onChange(event.target.value),
                "aria-invalid": Boolean(error),
                "aria-describedby": error ? messageId : undefined,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: "",
                        disabled: true,
                        children: [
                            "Select ",
                            label.toLowerCase(),
                            "…"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/request-form/components/ChoiceWithOtherField.tsx",
                        lineNumber: 51,
                        columnNumber: 9
                    }, this),
                    options.map((option)=>option === otherSentinel ? null : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                            value: option,
                            children: option
                        }, option, false, {
                            fileName: "[project]/src/app/request-form/components/ChoiceWithOtherField.tsx",
                            lineNumber: 56,
                            columnNumber: 13
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: otherSentinel,
                        children: otherSentinel
                    }, void 0, false, {
                        fileName: "[project]/src/app/request-form/components/ChoiceWithOtherField.tsx",
                        lineNumber: 61,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/request-form/components/ChoiceWithOtherField.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                id: messageId,
                className: "field-error",
                children: error
            }, void 0, false, {
                fileName: "[project]/src/app/request-form/components/ChoiceWithOtherField.tsx",
                lineNumber: 63,
                columnNumber: 17
            }, this),
            isOther && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "field choice-other-field",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        className: `input${otherError ? ' has-error' : ''}`,
                        placeholder: `Enter ${label.toLowerCase()}`,
                        value: otherValue,
                        onChange: (event)=>onOtherChange(event.target.value),
                        "aria-label": `${label} — Other`,
                        "aria-invalid": Boolean(otherError)
                    }, void 0, false, {
                        fileName: "[project]/src/app/request-form/components/ChoiceWithOtherField.tsx",
                        lineNumber: 67,
                        columnNumber: 11
                    }, this),
                    otherError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "field-error",
                        children: otherError
                    }, void 0, false, {
                        fileName: "[project]/src/app/request-form/components/ChoiceWithOtherField.tsx",
                        lineNumber: 75,
                        columnNumber: 26
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/request-form/components/ChoiceWithOtherField.tsx",
                lineNumber: 66,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/request-form/components/ChoiceWithOtherField.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/request-form/components/TextField.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TextField",
    ()=>TextField
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
'use client';
;
function TextField({ label, required = false, type = 'text', value, error, hint, placeholder, onChange, className }) {
    const fieldId = `field-${label.replace(/\s+/g, '-').toLowerCase()}`;
    function handleChange(event) {
        onChange(event.target.value);
    }
    const messageId = `${fieldId}-message`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `field${className ? ` ${className}` : ''}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "field-label",
                htmlFor: fieldId,
                children: [
                    label,
                    required && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "required",
                        children: "*"
                    }, void 0, false, {
                        fileName: "[project]/src/app/request-form/components/TextField.tsx",
                        lineNumber: 30,
                        columnNumber: 22
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/request-form/components/TextField.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                id: fieldId,
                className: `input${error ? ' has-error' : ''}`,
                type: type,
                value: value,
                placeholder: placeholder,
                onChange: handleChange,
                autoComplete: "off",
                "aria-invalid": Boolean(error),
                "aria-describedby": error || hint ? messageId : undefined
            }, void 0, false, {
                fileName: "[project]/src/app/request-form/components/TextField.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            (hint || error) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                id: messageId,
                className: error ? 'field-error' : 'field-hint',
                children: error ?? hint
            }, void 0, false, {
                fileName: "[project]/src/app/request-form/components/TextField.tsx",
                lineNumber: 44,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/request-form/components/TextField.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/lib/auditor-api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-client.ts [app-ssr] (ecmascript)");
;
function getMetrics() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])('/auditor/metrics');
}
function getZohoLiveStatus() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])('/auditor/zoho-status');
}
function listRequests() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])('/auditor/requests');
}
function listEmployeeDirectory() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])('/auditor/employees/directory');
}
function getRequest(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}`);
}
function saveResolvedAccount(id, input) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/account`, {
        method: 'PUT',
        body: input
    });
}
function quickApproveRequest(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/quick-approve`, {
        method: 'POST'
    });
}
function escalateRequest(id, note) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/escalate`, {
        method: 'POST',
        body: {
            note
        }
    });
}
function updateEmployeeSubmission(id, input) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/submission`, {
        method: 'PUT',
        body: input
    });
}
function offboardEmployee(id, options = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/offboard`, {
        method: 'POST',
        body: options
    });
}
function runDueOffboardings(asOfIso) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])('/auditor/offboarding/run-due', {
        method: 'POST',
        body: asOfIso ? {
            asOfIso
        } : {}
    });
}
function searchEmployees(query) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/employees?query=${encodeURIComponent(query)}`);
}
function rejectRequest(id, reason) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/reject`, {
        method: 'POST',
        body: {
            reason
        }
    });
}
function returnRequest(id, reason) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/return`, {
        method: 'POST',
        body: {
            reason
        }
    });
}
function cancelRequest(id, reason) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/cancel`, {
        method: 'POST',
        body: {
            reason
        }
    });
}
function provisionRequest(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/provision`, {
        method: 'POST'
    });
}
function batchProvisionRequests(requestIds) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])('/auditor/requests/batch-provision', {
        method: 'POST',
        body: {
            requestIds
        }
    });
}
function retryProvisioning(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/retry`, {
        method: 'POST'
    });
}
function previewAccountNotification(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/notification-preview`);
}
function sendAccountNotification(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/notify`, {
        method: 'POST'
    });
}
function resendAccountNotification(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/requests/${id}/resend-notification`, {
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/auditor/audit-log${suffix}`);
}
}),
"[project]/src/lib/form-api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getEmployeeSubmission",
    ()=>getEmployeeSubmission,
    "getFormCatalog",
    ()=>getFormCatalog,
    "listMyHrRequests",
    ()=>listMyHrRequests,
    "offboardEmployee",
    ()=>offboardEmployee,
    "searchEmployees",
    ()=>searchEmployees,
    "submitOnboardingForm",
    ()=>submitOnboardingForm,
    "updateEmployeeInfo",
    ()=>updateEmployeeInfo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-client.ts [app-ssr] (ecmascript)");
;
function getFormCatalog() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])('/form/catalog');
}
function submitOnboardingForm(values) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])('/form/submit', {
        method: 'POST',
        body: values
    });
}
function listMyHrRequests() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])('/form/my-requests');
}
function searchEmployees(query) {
    const search = query.trim() ? `?query=${encodeURIComponent(query.trim())}` : '';
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/form/employees${search}`);
}
function getEmployeeSubmission(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/form/employees/${id}`);
}
function updateEmployeeInfo(id, input) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/form/employees/${id}`, {
        method: 'PUT',
        body: input
    });
}
function offboardEmployee(id, options = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/form/employees/${id}/offboard`, {
        method: 'POST',
        body: options
    });
}
}),
];

//# sourceMappingURL=src_0uumaks._.js.map