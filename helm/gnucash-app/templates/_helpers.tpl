{{/*
Expand the name of the chart.
*/}}
{{- define "gnucash-app.name" -}}
{{- default .Chart.Name .Values.app.name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "gnucash-app.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.app.name }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "gnucash-app.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "gnucash-app.labels" -}}
helm.sh/chart: {{ include "gnucash-app.chart" . }}
{{ include "gnucash-app.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: gnucash
environment: {{ .Values.global.environment }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "gnucash-app.selectorLabels" -}}
app.kubernetes.io/name: {{ include "gnucash-app.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "gnucash-app.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "gnucash-app.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create image name
*/}}
{{- define "gnucash-app.image" -}}
{{- printf "%s:%s" .Values.app.image.repository .Values.app.image.tag }}
{{- end }}

{{/*
Create migration image name
*/}}
{{- define "gnucash-app.migrationImage" -}}
{{- printf "%s:%s" .Values.migration.image.repository .Values.migration.image.tag }}
{{- end }}
