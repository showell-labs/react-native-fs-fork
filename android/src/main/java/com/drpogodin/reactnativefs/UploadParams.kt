package com.drpogodin.reactnativefs

import com.facebook.react.bridge.ReadableMap
import java.net.URL

class UploadParams {
    interface onUploadComplete {
        constructor(res: UploadResult?)
    }

    interface onUploadProgress {
        constructor(totalBytesExpectedToSend: Int, totalBytesSent: Int)
    }

    interface onUploadBegin {
        constructor()
    }

    @JvmField
    var src: URL? = null
    @JvmField
    var files: ArrayList<ReadableMap>? = null
    @JvmField
    var binaryStreamOnly = false
    var name: String? = null
    @JvmField
    var headers: ReadableMap? = null
    @JvmField
    var fields: ReadableMap? = null
    @JvmField
    var method: String? = null
    @JvmField
    var onUploadComplete: onUploadComplete? = null
    @JvmField
    var onUploadProgress: onUploadProgress? = null
    @JvmField
    var onUploadBegin: onUploadBegin? = null
}
