# Shared Kernel

当前目录（`src/domain`）是 Shared Kernel 层，包含全系统通用的“元数据”和“基础规则”，它是所有模块的“基础”，所有模块的业务状态机都依赖于它。

## 定位

由于 Shared Kernel 与 Module Domain 容易混淆，下面通过清晰的对比来解释它们的区别。

**Shared Kernel 与 Module Domain 的边界划分：**

| 维度 | `src/domain` (Shared Kernel / L0) | `src/features/[module]/domain` (Feature Core / L3) |
| :--- | :--- | :--- |
| **定义** | **通用语言 (Ubiquitous Language) 的基石**。全系统通用的“元数据”和“基础规则”。 | **特定业务场景的核心逻辑**。只服务于该功能模块的“业务状态机”。 |
| **依赖性** | **被所有模块依赖**。绝对不能依赖任何 Feature。 | **被 Application 层依赖**。原则上不应被其他 Feature 直接依赖（除非通过 Public API）。 |
| **变化频率** | **极低**。一旦修改，可能导致全系统重构。 | **中/高**。随着业务迭代频繁变更。 |
| **典型内容** | `Currency`, `City`, `CompanySize`, `Email`, `ID Types` | `JobPosting`, `CandidateProfile`, `MatchScore` |
| **反例 (不要放)** | 包含复杂状态流转的聚合根 (Aggregate Root)，如 `Order`。 | 通用的枚举，如 `Currency` (除非它只在支付模块用到)。 |

## 目录结构

**按概念聚合 (Concept-based / Screaming Architecture)：**
将相关联的 Entity, Value Object, Rules, Zod Schema 放在同一个文件或同一个文件夹下。

**规则：**
1.  **扁平化优先**：如果一个概念能在一个文件内讲清楚，就不要拆分文件夹。
2.  **领域模型文件 (`*.model.ts`)**：包含 Schema, Type, 和 Factory。
3.  **纯逻辑/规则文件 (`*.rules.ts`)**：包含纯函数业务逻辑（如果逻辑很复杂）。

**目录结构详情：**
```txt
src/domain/
├── ai/
│   └── embedding.model.ts
├── career/               # 职业相关原语
│   ├── company.ts        # CompanySize (原 core/value-objects/company-size.ts)
│   ├── education.ts      # DegreeLevel (原 core/value-objects/degree-level.ts)
│   ├── employment.ts     # EmploymentType (原 core/value-objects/employment-type.ts)
│   ├── salary.ts         # SalaryUnit (原 core/value-objects/salary-unit.ts)
│   └── work-policy.ts    # RemotePolicy (原 core/value-objects/remote-policy.ts)
├── geo/                  # 地理相关原语
│   └── city.ts           # CityDetail, CityNodeType (合并了 entities/city.ts 和 value-objects/city-node-type.ts)
└── shared/               # 通用技术原语
    ├── currency.ts       # Currency (原 core/value-objects/currency.ts)
    └── pagination.ts     # Pagination (原 core/value-objects/pagination.ts)
```
