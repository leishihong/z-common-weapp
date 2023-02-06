import { FC, memo, useEffect, useCallback } from 'react';
import { View } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import TaroCropper from 'taro-cropper';
import { useSelector, useDispatch } from 'react-redux';

const CropperImage: FC = () => {
  const router: any = useRouter();
  const { cropperUrl, callback } = useSelector(({ cropperImageState }) => cropperImageState);

  useEffect(() => {
    Taro.getImageInfo({
      src: cropperUrl,
      success(res) {
        console.log(res.width, res, 'ooo');
      }
    });
  }, []);

  const handleClickCut = useCallback((cropperItem) => {
    // Taro.getImageInfo({
    //   src: cropperItem,
    //   success(res) {
    //     console.log(res.width, res, 'ooo');
    //   }
    // });
    callback?.(cropperItem);
    setTimeout(() => {
      Taro.navigateBack();
    }, 300);
  }, []);

  const handleCancel = () => {
    Taro.navigateBack();
  };

  return (
    <View>
      <TaroCropper
        src={cropperUrl}
        cropperWidth={router.params.w || 500}
        cropperHeight={router.params.h || 500}
        themeColor='#F03B56'
        onCancel={handleCancel}
        fullScreen
        hideCancelText={false}
        onCut={handleClickCut}
      />
    </View>
  );
};
export default memo(CropperImage);
