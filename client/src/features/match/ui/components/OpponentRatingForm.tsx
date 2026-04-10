import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { TextBox, TextField, TextArea, colors, spacing } from '@ui';

interface OpponentRatingFormProps {
  score: number;
  review: string;
  mvpName: string;
  onScoreChange: (score: number) => void;
  onReviewChange: (text: string) => void;
  onMvpNameChange: (text: string) => void;
}

export function OpponentRatingForm({
  score,
  review,
  mvpName,
  onScoreChange,
  onReviewChange,
  onMvpNameChange,
}: OpponentRatingFormProps) {
  return (
    <View style={styles.container}>
      <TextBox variant="body2Bold" color={colors.grey900}>상대팀 매너 점수</TextBox>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onScoreChange(star)} activeOpacity={0.7}>
            <TextBox
              variant="heading2"
              color={star <= score ? colors.yellow500 : colors.grey200}
            >
              ★
            </TextBox>
          </TouchableOpacity>
        ))}
      </View>

      <TextField
        title="상대팀 MVP (선택)"
        value={mvpName}
        onChangeText={onMvpNameChange}
        placeholder="상대팀 MVP 이름을 입력하세요 (선택)"
        maxLength={50}
      />

      <TextArea
        title="리뷰 (선택)"
        value={review}
        onChangeText={onReviewChange}
        placeholder="상대팀에 대한 리뷰를 남겨주세요 (선택)"
        maxLength={500}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[4],
  },
  stars: {
    flexDirection: 'row',
    gap: spacing[2],
  },
});
