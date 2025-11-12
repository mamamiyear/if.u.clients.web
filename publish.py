import os
import qiniu

# 七牛云的配置信息
access_key = 'IpeHQ-vdzi2t1YD53NDupyE8e9kxNZha2n5-m_3J'
secret_key = '7wF4JM0cnKFwBfrGVZrS12Wq4VWbphm0DpHRfK6O'
bucket_name = 'ifindu'
# 可以指定一个七牛云空间的前缀，方便管理文件
prefix = ''

# 初始化七牛云的认证信息
q = qiniu.Auth(access_key, secret_key)
# 初始化七牛云的存储桶对象
bucket = qiniu.BucketManager(q)

def upload_file(local_file_path, remote_file_path):
    """
    上传单个文件到七牛云
    :param local_file_path: 本地文件的路径
    :param remote_file_path: 七牛云空间中的文件路径
    """
    # 生成上传凭证
    token = q.upload_token(bucket_name, remote_file_path)
    # 初始化七牛云的上传对象
    ret, info = qiniu.put_file(token, remote_file_path, local_file_path)
    if info.status_code == 200:
        print(f"文件 {local_file_path} 上传成功，七牛云路径: {remote_file_path}")
    else:
        print(f"文件 {local_file_path} 上传失败，错误信息: {info.text_body}")

def upload_folder(folder_path):
    """
    上传文件夹到七牛云
    :param folder_path: 本地文件夹的路径
    """
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            # 构建本地文件的完整路径
            local_file_path = os.path.join(root, file)
            # 构建七牛云空间中的文件路径
            relative_path = os.path.relpath(local_file_path, folder_path)
            remote_file_path = os.path.join(prefix, relative_path).replace("\\", "/")
            # 调用上传单个文件的函数
            upload_file(local_file_path, remote_file_path)

if __name__ == "__main__":
    # 要上传的本地文件夹路径
    local_folder_path = 'dist/'
    upload_folder(local_folder_path)
