; مثبّت سبورتي — سكربت NSIS مخصص
; يستعمله electron-builder (nsis.script) فيتجنّب خطوة Wine عند البناء من Linux:
; برنامج إلغاء التثبيت يكتبه NSIS نفسه عبر WriteUninstaller.
; القيم ${PRODUCT_NAME} و${APP_64} وغيرها يمرّرها electron-builder.

!include "MUI2.nsh"
!include "FileFunc.nsh"

!define EXE_NAME "${PRODUCT_FILENAME}.exe"
!define UNINST_NAME "Uninstall ${PRODUCT_FILENAME}.exe"
!define UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}"
!define PROG_ID "Sbourati.Lesson"

Name "${PRODUCT_NAME}"
BrandingText "${PRODUCT_NAME} ${VERSION}"
RequestExecutionLevel user
InstallDir "$LOCALAPPDATA\Programs\${APP_FILENAME}"
InstallDirRegKey HKCU "Software\${APP_GUID}" "InstallLocation"
ShowInstDetails show
ShowUninstDetails show

!ifndef MUI_ICON
  !define MUI_ICON "${BUILD_RESOURCES_DIR}\icon.ico"
!endif
!ifndef MUI_UNICON
  !define MUI_UNICON "${BUILD_RESOURCES_DIR}\icon.ico"
!endif
!define MUI_ABORTWARNING
!define MUI_FINISHPAGE_RUN "$INSTDIR\${EXE_NAME}"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "Arabic"
!insertmacro MUI_LANGUAGE "English"

Function .onInit
  StrCpy $LANGUAGE ${LANG_ARABIC}
FunctionEnd

Section "Install"
  ; إغلاق نسخة مفتوحة من البرنامج قبل استبدال ملفاته
  nsExec::Exec 'taskkill /IM "${EXE_NAME}" /F'

  SetOutPath "$INSTDIR"
  InitPluginsDir
  File "/oname=$PLUGINSDIR\app-64.${COMPRESSION_METHOD}" "${APP_64}"
  DetailPrint "Extracting..."
  Nsis7z::Extract "$PLUGINSDIR\app-64.${COMPRESSION_METHOD}"
  Delete "$PLUGINSDIR\app-64.${COMPRESSION_METHOD}"

  WriteUninstaller "$INSTDIR\${UNINST_NAME}"

  ; الاختصارات
  CreateShortCut "$DESKTOP\${SHORTCUT_NAME}.lnk" "$INSTDIR\${EXE_NAME}" "" "$INSTDIR\${EXE_NAME}" 0
  CreateShortCut "$SMPROGRAMS\${SHORTCUT_NAME}.lnk" "$INSTDIR\${EXE_NAME}" "" "$INSTDIR\${EXE_NAME}" 0

  ; ربط ملفات الدروس .sboard بالبرنامج
  WriteRegStr HKCU "Software\Classes\.sboard" "" "${PROG_ID}"
  WriteRegStr HKCU "Software\Classes\${PROG_ID}" "" "درس سبورتي"
  WriteRegStr HKCU "Software\Classes\${PROG_ID}\DefaultIcon" "" "$INSTDIR\${EXE_NAME},0"
  WriteRegStr HKCU "Software\Classes\${PROG_ID}\shell\open\command" "" '"$INSTDIR\${EXE_NAME}" "%1"'
  System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0, p 0, p 0)'

  ; قائمة «البرامج والميزات»
  WriteRegStr HKCU "Software\${APP_GUID}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "${UNINST_KEY}" "DisplayName" "${UNINSTALL_DISPLAY_NAME}"
  WriteRegStr HKCU "${UNINST_KEY}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "${UNINST_KEY}" "DisplayIcon" "$INSTDIR\${EXE_NAME},0"
  WriteRegStr HKCU "${UNINST_KEY}" "Publisher" "Sbourati"
  WriteRegStr HKCU "${UNINST_KEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "${UNINST_KEY}" "UninstallString" '"$INSTDIR\${UNINST_NAME}"'
  WriteRegStr HKCU "${UNINST_KEY}" "QuietUninstallString" '"$INSTDIR\${UNINST_NAME}" /S'
  WriteRegDWORD HKCU "${UNINST_KEY}" "NoModify" 1
  WriteRegDWORD HKCU "${UNINST_KEY}" "NoRepair" 1
  ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
  IntFmt $0 "0x%08X" $0
  WriteRegDWORD HKCU "${UNINST_KEY}" "EstimatedSize" "$0"
SectionEnd

Section "Uninstall"
  nsExec::Exec 'taskkill /IM "${EXE_NAME}" /F'
  Delete "$DESKTOP\${SHORTCUT_NAME}.lnk"
  Delete "$SMPROGRAMS\${SHORTCUT_NAME}.lnk"
  RMDir /r "$INSTDIR"
  ReadRegStr $0 HKCU "Software\Classes\.sboard" ""
  StrCmp $0 "${PROG_ID}" 0 +2
    DeleteRegKey HKCU "Software\Classes\.sboard"
  DeleteRegKey HKCU "Software\Classes\${PROG_ID}"
  DeleteRegKey HKCU "${UNINST_KEY}"
  DeleteRegKey HKCU "Software\${APP_GUID}"
  System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0, p 0, p 0)'
  ; ملاحظة: الدروس والحفظ التلقائي في AppData تبقى محفوظة
SectionEnd
