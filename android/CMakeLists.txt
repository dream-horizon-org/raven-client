project(StorageModule)
cmake_minimum_required(VERSION 3.8)

set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 17)

set(PACKAGE_NAME "raven_storage")

set(MMKV_SRC jsi-adapter.cpp)

set(REACT_NATIVE_DIR ${NODE_MODULES}/react-native)

set(REACT_NATIVE_JSI_DIR ${REACT_NATIVE_DIR}/ReactCommon/jsi)
add_library(jsi ${REACT_NATIVE_JSI_DIR}/jsi/jsi.cpp)
target_include_directories(jsi PUBLIC ${REACT_NATIVE_JSI_DIR})

set(CPP_ROOT ${CMAKE_CURRENT_SOURCE_DIR}/../cpp/)

add_library(${PACKAGE_NAME}
        SHARED
        ${MMKV_SRC}
)


target_include_directories(
        ${PACKAGE_NAME}
        PRIVATE
        ${CPP_ROOT}
        "${REACT_NATIVE_DIR}/React"
        "${REACT_NATIVE_DIR}/React/Base"
        "${REACT_NATIVE_DIR}/ReactCommon"
        "${REACT_NATIVE_DIR}/ReactCommon/jsi/jsi"
)

add_dependencies(${PACKAGE_NAME} jsi)

target_link_libraries(
        ${PACKAGE_NAME}
        jsi
        log
        android
)

